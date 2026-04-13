import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.49.1/cors";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const MP_API = "https://api.mercadopago.com";

interface PaymentRequest {
  offer_id: string;
  checkout_page_id: string;
  payment_method: string; // "pix" | "credit_card" | "boleto"
  customer: {
    name: string;
    email: string;
    document: string; // CPF
    whatsapp?: string;
  };
  card_token?: string; // For credit card payments
  installments?: number;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body: PaymentRequest = await req.json();

    // Validate required fields
    if (!body.offer_id || !body.checkout_page_id || !body.payment_method || !body.customer) {
      return new Response(
        JSON.stringify({ error: "Campos obrigatórios: offer_id, checkout_page_id, payment_method, customer" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!body.customer.name || !body.customer.email || !body.customer.document) {
      return new Response(
        JSON.stringify({ error: "Dados do cliente obrigatórios: name, email, document" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch checkout page to get organization_id
    const { data: checkoutPage, error: cpError } = await supabase
      .from("checkout_pages")
      .select("organization_id, offer_id")
      .eq("id", body.checkout_page_id)
      .single();

    if (cpError || !checkoutPage) {
      return new Response(
        JSON.stringify({ error: "Checkout não encontrado" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch offer details
    const { data: offer, error: offerError } = await supabase
      .from("offers")
      .select("*, products:product_id(name)")
      .eq("id", body.offer_id)
      .single();

    if (offerError || !offer) {
      return new Response(
        JSON.stringify({ error: "Oferta não encontrada" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch Mercado Pago credentials from payment_gateways
    const { data: gateway, error: gwError } = await supabase
      .from("payment_gateways")
      .select("credentials")
      .eq("organization_id", checkoutPage.organization_id)
      .eq("provider", "mercado_pago")
      .eq("is_active", true)
      .order("is_primary", { ascending: false })
      .limit(1)
      .single();

    if (gwError || !gateway) {
      return new Response(
        JSON.stringify({ error: "Gateway Mercado Pago não configurado ou inativo" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const accessToken = (gateway.credentials as Record<string, string>).access_token;
    if (!accessToken) {
      return new Response(
        JSON.stringify({ error: "Access Token do Mercado Pago não encontrado" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create or find customer
    const { data: customer } = await supabase
      .from("customers")
      .upsert(
        {
          organization_id: checkoutPage.organization_id,
          name: body.customer.name,
          email: body.customer.email,
          document: body.customer.document,
          phone: body.customer.whatsapp || null,
        },
        { onConflict: "organization_id,email" }
      )
      .select()
      .single();

    const productName = (offer as any).products?.name || offer.name;
    const isRecurring = offer.billing_type === "recurring";

    let paymentResult: any;

    if (isRecurring) {
      // ── SUBSCRIPTION (preapproval) ──
      paymentResult = await createSubscription({
        accessToken,
        offer,
        customer: body.customer,
        productName,
      });
    } else {
      // ── ONE-TIME PAYMENT ──
      paymentResult = await createPayment({
        accessToken,
        offer,
        customer: body.customer,
        productName,
        paymentMethod: body.payment_method,
        cardToken: body.card_token,
        installments: body.installments,
      });
    }

    // Create order in our database
    const { data: order } = await supabase
      .from("orders")
      .insert({
        organization_id: checkoutPage.organization_id,
        customer_id: customer?.id || null,
        offer_id: body.offer_id,
        amount_cents: offer.price_cents,
        payment_method: body.payment_method,
        status: paymentResult.status === "approved" ? "paid" : "pending",
        external_id: paymentResult.id?.toString() || null,
      })
      .select()
      .single();

    return new Response(
      JSON.stringify({
        success: true,
        payment: {
          id: paymentResult.id,
          status: paymentResult.status,
          status_detail: paymentResult.status_detail || null,
          // Pix data
          qr_code: paymentResult.point_of_interaction?.transaction_data?.qr_code || null,
          qr_code_base64: paymentResult.point_of_interaction?.transaction_data?.qr_code_base64 || null,
          ticket_url: paymentResult.point_of_interaction?.transaction_data?.ticket_url || null,
          // Boleto data
          barcode: paymentResult.barcode?.content || null,
          boleto_url: paymentResult.transaction_details?.external_resource_url || null,
          // Subscription data
          init_point: paymentResult.init_point || null,
        },
        order_id: order?.id || null,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Payment error:", error);
    const message = error instanceof Error ? error.message : "Erro interno";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// ── ONE-TIME PAYMENT ──
async function createPayment({
  accessToken,
  offer,
  customer,
  productName,
  paymentMethod,
  cardToken,
  installments,
}: {
  accessToken: string;
  offer: any;
  customer: { name: string; email: string; document: string };
  productName: string;
  paymentMethod: string;
  cardToken?: string;
  installments?: number;
}) {
  const paymentBody: any = {
    transaction_amount: offer.price_cents / 100,
    description: productName,
    payer: {
      email: customer.email,
      first_name: customer.name.split(" ")[0],
      last_name: customer.name.split(" ").slice(1).join(" ") || customer.name.split(" ")[0],
      identification: {
        type: "CPF",
        number: customer.document.replace(/\D/g, ""),
      },
    },
  };

  if (paymentMethod === "pix") {
    paymentBody.payment_method_id = "pix";
  } else if (paymentMethod === "boleto") {
    paymentBody.payment_method_id = "bolbradesco";
  } else if (paymentMethod === "credit_card") {
    if (!cardToken) throw new Error("Token do cartão é obrigatório");
    paymentBody.token = cardToken;
    paymentBody.installments = installments || 1;
  }

  const response = await fetch(`${MP_API}/v1/payments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "X-Idempotency-Key": crypto.randomUUID(),
    },
    body: JSON.stringify(paymentBody),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("MP Payment Error:", JSON.stringify(data));
    throw new Error(data.message || `Erro no Mercado Pago [${response.status}]`);
  }

  return data;
}

// ── SUBSCRIPTION (preapproval) ──
async function createSubscription({
  accessToken,
  offer,
  customer,
  productName,
}: {
  accessToken: string;
  offer: any;
  customer: { name: string; email: string; document: string };
  productName: string;
}) {
  const frequencyMap: Record<string, { frequency: number; frequency_type: string }> = {
    monthly: { frequency: 1, frequency_type: "months" },
    quarterly: { frequency: 3, frequency_type: "months" },
    semiannual: { frequency: 6, frequency_type: "months" },
    annual: { frequency: 12, frequency_type: "months" },
  };

  const interval = offer.billing_interval || "monthly";
  const freq = frequencyMap[interval] || frequencyMap.monthly;

  const subscriptionBody = {
    reason: productName,
    auto_recurring: {
      frequency: freq.frequency,
      frequency_type: freq.frequency_type,
      transaction_amount: offer.price_cents / 100,
      currency_id: "BRL",
    },
    payer_email: customer.email,
    back_url: `${Deno.env.get("SUPABASE_URL")?.replace(".supabase.co", ".lovable.app") || ""}`,
    status: "pending",
  };

  if (offer.trial_days && offer.trial_days > 0) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + offer.trial_days);
    (subscriptionBody.auto_recurring as any).start_date = startDate.toISOString();
  }

  const response = await fetch(`${MP_API}/preapproval`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(subscriptionBody),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("MP Subscription Error:", JSON.stringify(data));
    throw new Error(data.message || `Erro na assinatura Mercado Pago [${response.status}]`);
  }

  return data;
}
