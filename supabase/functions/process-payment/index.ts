import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const MP_API = "https://api.mercadopago.com";

interface PaymentRequest {
  offer_id: string;
  checkout_page_id: string;
  payment_method: string;
  customer: {
    name: string;
    email: string;
    document: string;
    whatsapp?: string;
  };
  card_token?: string;
  installments?: number;
  amount_cents?: number;
  coupon_code?: string;
}

const INTERVAL_MAP: Record<string, { frequency: number; frequency_type: string }> = {
  monthly: { frequency: 1, frequency_type: "months" },
  quarterly: { frequency: 3, frequency_type: "months" },
  semiannual: { frequency: 6, frequency_type: "months" },
  annual: { frequency: 12, frequency_type: "months" },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body: PaymentRequest = await req.json();

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

    // Upsert customer
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
    const finalAmountCents = body.amount_cents || offer.price_cents;
    const isRecurring = offer.billing_type === "recurring";

    if (isRecurring && body.payment_method === "credit_card") {
      // ===== RECURRING: Use MP Preapproval (auto_recurring with card_token) =====
      if (!body.card_token) {
        return new Response(
          JSON.stringify({ error: "Token do cartão é obrigatório para assinaturas" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const interval = INTERVAL_MAP[offer.billing_interval || "monthly"] || INTERVAL_MAP.monthly;

      const preapprovalBody: any = {
        reason: productName,
        external_reference: `${body.checkout_page_id}|${body.offer_id}`,
        payer_email: body.customer.email,
        card_token_id: body.card_token,
        auto_recurring: {
          frequency: interval.frequency,
          frequency_type: interval.frequency_type,
          transaction_amount: finalAmountCents / 100,
          currency_id: "BRL",
        },
        back_url: `${req.headers.get("origin") || "https://bianchinipay.lovable.app"}`,
        status: "authorized",
      };

      // Add trial if configured
      if (offer.trial_days && offer.trial_days > 0) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() + offer.trial_days);
        preapprovalBody.auto_recurring.start_date = startDate.toISOString();
        preapprovalBody.auto_recurring.free_trial = {
          frequency: offer.trial_days,
          frequency_type: "days",
        };
      }

      console.log("Creating preapproval:", JSON.stringify(preapprovalBody));

      const preapprovalRes = await fetch(`${MP_API}/preapproval`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(preapprovalBody),
      });

      const preapprovalData = await preapprovalRes.json();

      if (!preapprovalRes.ok) {
        console.error("MP Preapproval Error:", JSON.stringify(preapprovalData));
        throw new Error(preapprovalData.message || `Erro no Mercado Pago [${preapprovalRes.status}]`);
      }

      // Create order for the subscription
      const subStatus = preapprovalData.status === "authorized" ? "paid" : "pending";

      const { data: order } = await supabase
        .from("orders")
        .insert({
          organization_id: checkoutPage.organization_id,
          customer_id: customer?.id || null,
          offer_id: body.offer_id,
          amount_cents: finalAmountCents,
          payment_method: "credit_card",
          status: subStatus,
          external_id: preapprovalData.id?.toString() || null,
        })
        .select()
        .single();

      return new Response(
        JSON.stringify({
          success: true,
          type: "subscription",
          payment: {
            id: preapprovalData.id,
            status: preapprovalData.status === "authorized" ? "approved" : preapprovalData.status,
            status_detail: preapprovalData.status,
          },
          order_id: order?.id || null,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      // ===== ONE-TIME: Direct payment =====
      const paymentResult = await createPayment({
        accessToken,
        amountCents: finalAmountCents,
        customer: body.customer,
        productName,
        paymentMethod: body.payment_method,
        cardToken: body.card_token,
        installments: body.installments,
      });

      const orderStatus = paymentResult.status === "approved" ? "paid" : "pending";

      const { data: order } = await supabase
        .from("orders")
        .insert({
          organization_id: checkoutPage.organization_id,
          customer_id: customer?.id || null,
          offer_id: body.offer_id,
          amount_cents: finalAmountCents,
          payment_method: body.payment_method,
          status: orderStatus,
          external_id: paymentResult.id?.toString() || null,
        })
        .select()
        .single();

      return new Response(
        JSON.stringify({
          success: true,
          type: "one_time",
          payment: {
            id: paymentResult.id,
            status: paymentResult.status,
            status_detail: paymentResult.status_detail || null,
            qr_code: paymentResult.point_of_interaction?.transaction_data?.qr_code || null,
            qr_code_base64: paymentResult.point_of_interaction?.transaction_data?.qr_code_base64 || null,
            ticket_url: paymentResult.point_of_interaction?.transaction_data?.ticket_url || null,
            barcode: paymentResult.barcode?.content || null,
            boleto_url: paymentResult.transaction_details?.external_resource_url || null,
          },
          order_id: order?.id || null,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error: unknown) {
    console.error("Payment error:", error);
    const message = error instanceof Error ? error.message : "Erro interno";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function createPayment({
  accessToken,
  amountCents,
  customer,
  productName,
  paymentMethod,
  cardToken,
  installments,
}: {
  accessToken: string;
  amountCents: number;
  customer: { name: string; email: string; document: string };
  productName: string;
  paymentMethod: string;
  cardToken?: string;
  installments?: number;
}) {
  const paymentBody: any = {
    transaction_amount: amountCents / 100,
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
