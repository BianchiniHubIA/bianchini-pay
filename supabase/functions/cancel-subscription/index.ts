import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface CancelRequest {
  external_id?: string; // Mercado Pago preapproval id
  order_id?: string;    // alternative: our internal order id
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
    console.error("fireWebhook error:", e);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const providedSecret =
      req.headers.get("x-webhook-secret") ||
      req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
      "";

    if (!providedSecret) {
      return new Response(JSON.stringify({ error: "Missing secret (X-Webhook-Secret header)" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body: CancelRequest = await req.json().catch(() => ({}));
    if (!body.external_id && !body.order_id) {
      return new Response(JSON.stringify({ error: "external_id or order_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Locate order
    const orderQuery = supabase
      .from("orders")
      .select("*, offers:offer_id(*, products:product_id(id, webhook_secret, organization_id))")
      .limit(1);

    const { data: orders, error: oErr } = body.external_id
      ? await orderQuery.eq("external_id", body.external_id)
      : await orderQuery.eq("id", body.order_id!);

    if (oErr || !orders || orders.length === 0) {
      return new Response(JSON.stringify({ error: "Order/subscription not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const order: any = orders[0];
    const product = order.offers?.products;

    if (!product?.webhook_secret) {
      return new Response(JSON.stringify({ error: "Product has no webhook_secret configured" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Constant-time-ish comparison
    if (providedSecret !== product.webhook_secret) {
      return new Response(JSON.stringify({ error: "Invalid secret" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (order.status === "cancelled") {
      return new Response(
        JSON.stringify({ success: true, already_cancelled: true, order_id: order.id }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Find Mercado Pago gateway for this org
    const { data: gateway } = await supabase
      .from("payment_gateways")
      .select("credentials")
      .eq("organization_id", product.organization_id)
      .eq("provider", "mercado_pago")
      .eq("is_active", true)
      .limit(1)
      .maybeSingle();

    const accessToken = (gateway?.credentials as any)?.access_token;

    let mpStatus: number | null = null;
    let mpBody: string | null = null;

    if (order.external_id && accessToken) {
      // Try preapproval cancel first (subscriptions)
      const isPreapproval = order.payment_method === "credit_card" && order.offers?.billing_type === "recurring";
      const url = isPreapproval
        ? `https://api.mercadopago.com/preapproval/${order.external_id}`
        : `https://api.mercadopago.com/v1/payments/${order.external_id}`;

      const payload = isPreapproval ? { status: "cancelled" } : { status: "cancelled" };

      const res = await fetch(url, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      mpStatus = res.status;
      mpBody = (await res.text()).slice(0, 500);

      if (!res.ok) {
        console.error("Mercado Pago cancel failed:", mpStatus, mpBody);
        return new Response(
          JSON.stringify({ error: "Failed to cancel at Mercado Pago", mp_status: mpStatus, mp_body: mpBody }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Update local order
    await supabase
      .from("orders")
      .update({ status: "cancelled", updated_at: new Date().toISOString() } as any)
      .eq("id", order.id);

    // Fire webhook to external site
    await fireWebhook(order.id, "subscription.cancelled");

    return new Response(
      JSON.stringify({
        success: true,
        order_id: order.id,
        external_id: order.external_id,
        mp_status: mpStatus,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("cancel-subscription error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "internal" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
