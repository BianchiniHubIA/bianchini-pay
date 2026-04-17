import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const MP_API = "https://api.mercadopago.com";

// Map MP status -> nosso status
function mapStatus(mpStatus: string): "paid" | "pending" | "refunded" | "cancelled" | "expired" {
  switch (mpStatus) {
    case "approved":
      return "paid";
    case "refunded":
    case "charged_back":
      return "refunded";
    case "cancelled":
      return "cancelled";
    case "rejected":
      return "cancelled";
    case "expired":
      return "expired";
    default:
      return "pending";
  }
}

async function fireWebhook(orderId: string, event: string) {
  try {
    await fetch(`${SUPABASE_URL}/functions/v1/send-webhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ order_id: orderId, event }),
    });
  } catch (e) {
    console.error("send-webhook failed", e);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const body = await req.json().catch(() => ({}));
    console.log("MP webhook recebido:", JSON.stringify(body), "query:", url.search);

    // MP envia: { type: 'payment', data: { id: '...' } } ou topic=payment&id=...
    const paymentId =
      body?.data?.id ??
      body?.resource?.split("/").pop() ??
      url.searchParams.get("id") ??
      url.searchParams.get("data.id");

    const type = body?.type ?? body?.topic ?? url.searchParams.get("topic") ?? "payment";

    if (!paymentId) {
      console.log("Sem paymentId, ignorando");
      return new Response(JSON.stringify({ ok: true, ignored: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Buscar order pelo external_id pra descobrir a organização e o gateway
    const { data: order } = await supabase
      .from("orders")
      .select("id, organization_id, status")
      .eq("external_id", String(paymentId))
      .maybeSingle();

    if (!order) {
      console.log("Order não encontrada pra payment", paymentId);
      return new Response(JSON.stringify({ ok: true, not_found: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Pegar credenciais MP da organização
    const { data: gateway } = await supabase
      .from("payment_gateways")
      .select("credentials")
      .eq("organization_id", order.organization_id)
      .eq("provider", "mercado_pago")
      .eq("is_active", true)
      .maybeSingle();

    const accessToken = (gateway?.credentials as any)?.access_token;
    if (!accessToken) {
      console.error("Sem access_token MP pra org", order.organization_id);
      return new Response(JSON.stringify({ ok: false, error: "no_token" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Consultar pagamento na API MP
    const endpoint = type === "preapproval" ? `/preapproval/${paymentId}` : `/v1/payments/${paymentId}`;
    const mpRes = await fetch(`${MP_API}${endpoint}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!mpRes.ok) {
      const errText = await mpRes.text();
      console.error("MP API error", mpRes.status, errText);
      return new Response(JSON.stringify({ ok: false, error: "mp_api" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const mpData = await mpRes.json();
    const newStatus = mapStatus(mpData.status);

    if (newStatus !== order.status) {
      await supabase
        .from("orders")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", order.id);

      console.log(`Order ${order.id}: ${order.status} -> ${newStatus}`);

      if (newStatus === "paid") await fireWebhook(order.id, "order.paid");
      if (newStatus === "refunded") await fireWebhook(order.id, "order.refunded");
      if (newStatus === "cancelled") await fireWebhook(order.id, "order.cancelled");
    }

    return new Response(JSON.stringify({ ok: true, status: newStatus }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("webhook error", e);
    // Sempre 200 pra MP não ficar reenviando
    return new Response(JSON.stringify({ ok: false }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
