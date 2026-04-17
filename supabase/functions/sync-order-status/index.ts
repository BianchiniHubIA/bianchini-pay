import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const MP_API = "https://api.mercadopago.com";

function mapStatus(mpStatus: string): "paid" | "pending" | "refunded" | "cancelled" | "expired" {
  switch (mpStatus) {
    case "approved":
      return "paid";
    case "refunded":
    case "charged_back":
      return "refunded";
    case "cancelled":
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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: claims, error: claimsErr } = await userClient.auth.getClaims(
      authHeader.replace("Bearer ", "")
    );
    if (claimsErr || !claims?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { order_id } = await req.json();
    if (!order_id) {
      return new Response(JSON.stringify({ error: "order_id obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Pega order via cliente do usuário (RLS valida acesso)
    const { data: order, error: oErr } = await userClient
      .from("orders")
      .select("id, organization_id, external_id, status, payment_method")
      .eq("id", order_id)
      .maybeSingle();

    if (oErr || !order) {
      return new Response(JSON.stringify({ error: "Pedido não encontrado" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!order.external_id) {
      return new Response(
        JSON.stringify({ error: "Pedido sem ID externo do Mercado Pago" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: gateway } = await admin
      .from("payment_gateways")
      .select("credentials")
      .eq("organization_id", order.organization_id)
      .eq("provider", "mercado_pago")
      .eq("is_active", true)
      .maybeSingle();

    const accessToken = (gateway?.credentials as any)?.access_token;
    if (!accessToken) {
      return new Response(
        JSON.stringify({ error: "Mercado Pago não configurado" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Tenta como pagamento; se falhar, tenta preapproval
    let mpRes = await fetch(`${MP_API}/v1/payments/${order.external_id}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!mpRes.ok) {
      mpRes = await fetch(`${MP_API}/preapproval/${order.external_id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
    }

    if (!mpRes.ok) {
      const errText = await mpRes.text();
      return new Response(
        JSON.stringify({ error: "Erro ao consultar Mercado Pago", detail: errText }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const mpData = await mpRes.json();
    const newStatus = mapStatus(mpData.status);

    if (newStatus !== order.status) {
      await admin
        .from("orders")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", order.id);

      if (newStatus === "paid") await fireWebhook(order.id, "order.paid");
      if (newStatus === "refunded") await fireWebhook(order.id, "order.refunded");
      if (newStatus === "cancelled") await fireWebhook(order.id, "order.cancelled");
    }

    return new Response(
      JSON.stringify({
        ok: true,
        previous_status: order.status,
        new_status: newStatus,
        mp_status: mpData.status,
        changed: newStatus !== order.status,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("sync error", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
