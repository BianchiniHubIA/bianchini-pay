import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface WebhookRequest {
  order_id: string;
  event: string; // order.paid | order.refunded | order.cancelled | subscription.cancelled | subscription.payment_failed
}

async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body: WebhookRequest = await req.json();
    if (!body.order_id || !body.event) {
      return new Response(JSON.stringify({ error: "order_id and event required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Load order + offer + product + customer
    const { data: order, error: oErr } = await supabase
      .from("orders")
      .select("*, offers:offer_id(*, products:product_id(*)), customers:customer_id(*)")
      .eq("id", body.order_id)
      .single();

    if (oErr || !order) {
      return new Response(JSON.stringify({ error: "Order not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const offer = (order as any).offers;
    const product = offer?.products;
    const customer = (order as any).customers;

    if (!product?.webhook_url || !product?.webhook_secret) {
      console.log(`Skipping webhook: product has no webhook configured (product_id=${product?.id})`);
      return new Response(JSON.stringify({ skipped: true, reason: "no_webhook_configured" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = {
      event: body.event,
      timestamp: new Date().toISOString(),
      order_id: order.id,
      external_id: order.external_id,
      customer: customer
        ? {
            name: customer.name,
            email: customer.email,
            document: customer.document,
            phone: customer.phone,
          }
        : null,
      product: { id: product.id, name: product.name },
      offer: offer
        ? {
            id: offer.id,
            name: offer.name,
            billing_type: offer.billing_type,
            billing_interval: offer.billing_interval,
            price_cents: offer.price_cents,
          }
        : null,
      payment: {
        method: order.payment_method,
        amount_cents: order.amount_cents,
        status: order.status,
      },
    };

    const bodyStr = JSON.stringify(payload);
    const signature = await hmacSha256Hex(product.webhook_secret, bodyStr);

    let statusCode: number | null = null;
    let responseBody: string | null = null;
    let error: string | null = null;

    try {
      const res = await fetch(product.webhook_url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Webhook-Signature": signature,
          "X-Webhook-Event": body.event,
        },
        body: bodyStr,
      });
      statusCode = res.status;
      responseBody = (await res.text()).slice(0, 2000);
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    }

    await supabase.from("webhook_deliveries").insert({
      organization_id: order.organization_id,
      product_id: product.id,
      order_id: order.id,
      event_type: body.event,
      target_url: product.webhook_url,
      payload,
      status_code: statusCode,
      response_body: responseBody,
      error,
      delivered_at: statusCode && statusCode >= 200 && statusCode < 300 ? new Date().toISOString() : null,
    });

    return new Response(
      JSON.stringify({ success: !error && statusCode! < 400, status_code: statusCode, error }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("send-webhook error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "internal" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
