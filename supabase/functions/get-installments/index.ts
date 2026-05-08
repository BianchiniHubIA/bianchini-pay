import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { checkout_page_id, bin, amount_cents, max_installments } = await req.json();

    if (!checkout_page_id || !amount_cents) {
      return new Response(JSON.stringify({ error: "checkout_page_id and amount_cents required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: cp } = await supabase
      .from("checkout_pages")
      .select("organization_id")
      .eq("id", checkout_page_id)
      .single();

    if (!cp) {
      return new Response(JSON.stringify({ error: "Checkout não encontrado" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: gateway } = await supabase
      .from("payment_gateways")
      .select("credentials")
      .eq("organization_id", cp.organization_id)
      .eq("provider", "mercado_pago")
      .eq("is_active", true)
      .order("is_primary", { ascending: false })
      .limit(1)
      .single();

    const accessToken = (gateway?.credentials as Record<string, string>)?.access_token;
    if (!accessToken) {
      return new Response(JSON.stringify({ error: "Gateway não configurado" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const amount = (amount_cents / 100).toFixed(2);
    const url = new URL("https://api.mercadopago.com/v1/payment_methods/installments");
    url.searchParams.set("amount", amount);
    if (bin && bin.length >= 6) url.searchParams.set("bin", bin.slice(0, 6));
    // Default fallback: ask for credit_card payment type
    url.searchParams.set("payment_type_id", "credit_card");

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await res.json();

    if (!res.ok) {
      console.error("MP installments error:", JSON.stringify(data));
      return new Response(JSON.stringify({ error: "Erro ao consultar parcelas", detail: data }), {
        status: 200, // don't break checkout
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Aggregate: take widest set of payer_costs across returned methods
    let payerCosts: any[] = [];
    if (Array.isArray(data)) {
      for (const m of data) {
        if (Array.isArray(m.payer_costs) && m.payer_costs.length > payerCosts.length) {
          payerCosts = m.payer_costs;
        }
      }
    }

    const cap = max_installments && max_installments > 0 ? max_installments : 12;
    const options = payerCosts
      .filter((p: any) => p.installments <= cap)
      .map((p: any) => ({
        installments: p.installments,
        installment_amount_cents: Math.round(p.installment_amount * 100),
        total_amount_cents: Math.round(p.total_amount * 100),
        installment_rate: p.installment_rate, // 0 = sem juros
        recommended_message: p.recommended_message,
      }))
      .sort((a, b) => a.installments - b.installments);

    return new Response(JSON.stringify({ options }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("get-installments error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
