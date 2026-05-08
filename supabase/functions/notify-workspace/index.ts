import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const WORKSPACE_URL = Deno.env.get("WORKSPACE_URL") ?? "";
const WORKSPACE_WEBHOOK_SECRET = Deno.env.get("WORKSPACE_WEBHOOK_SECRET") ?? "";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { order_id } = await req.json();
    if (!order_id) {
      return new Response(JSON.stringify({ error: "order_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!WORKSPACE_URL || !WORKSPACE_WEBHOOK_SECRET) {
      console.log("notify-workspace skipped: secrets not configured");
      return new Response(JSON.stringify({ skipped: true, reason: "secrets_missing" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: order, error } = await supabase
      .from("orders")
      .select("*, offers:offer_id(*, products:product_id(*)), customers:customer_id(*)")
      .eq("id", order_id)
      .single();

    if (error || !order) {
      return new Response(JSON.stringify({ error: "order not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const product = (order as any).offers?.products;
    const offer = (order as any).offers;
    const customer = (order as any).customers;

    if (!product?.workspace_course_id) {
      return new Response(JSON.stringify({ skipped: true, reason: "no_workspace_course_linked" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!customer?.email) {
      return new Response(JSON.stringify({ error: "customer email missing" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = {
      email: customer.email,
      full_name: customer.name,
      phone: customer.phone ?? null,
      course_id: product.workspace_course_id,
      course_title: product.workspace_course_title ?? product.name,
      plan_id: offer?.workspace_plan_id ?? null,
      plan_name: offer?.workspace_plan_name ?? offer?.name ?? null,
      offer_id: offer?.id ?? null,
      offer_name: offer?.name ?? null,
      order_id: order.id,
      product_name: product.name,
      amount_cents: order.amount_cents,
      purchased_at: new Date().toISOString(),
    };

    const url = `${WORKSPACE_URL.replace(/\/$/, "")}/functions/v1/grant-access`;
    let statusCode: number | null = null;
    let responseBody: string | null = null;
    let errMsg: string | null = null;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Webhook-Secret": WORKSPACE_WEBHOOK_SECRET,
        },
        body: JSON.stringify(payload),
      });
      statusCode = res.status;
      responseBody = (await res.text()).slice(0, 2000);
    } catch (e) {
      errMsg = e instanceof Error ? e.message : String(e);
    }

    // Try to parse Workspace response and persist credentials on the order
    let workspaceAccess: Record<string, unknown> | null = null;
    if (responseBody && statusCode && statusCode >= 200 && statusCode < 300) {
      try {
        const parsed = JSON.parse(responseBody);
        const tempPassword =
          parsed.temporary_password ?? parsed.temp_password ?? parsed.password ?? null;
        const loginUrl =
          parsed.login_url ?? parsed.access_url ?? `${WORKSPACE_URL.replace(/\/$/, "")}/auth`;
        const accessEmail = parsed.email ?? customer.email;
        if (tempPassword || parsed.user_created) {
          workspaceAccess = {
            login_url: loginUrl,
            email: accessEmail,
            temporary_password: tempPassword,
            user_created: parsed.user_created ?? null,
            course_title: product.workspace_course_title ?? product.name,
          };
          await supabase
            .from("orders")
            .update({ workspace_access: workspaceAccess })
            .eq("id", order.id);
        }
      } catch (e) {
        console.error("Failed to parse workspace response:", e);
      }
    }

    await supabase.from("webhook_deliveries").insert({
      organization_id: order.organization_id,
      product_id: product.id,
      order_id: order.id,
      event_type: "workspace.grant_access",
      target_url: url,
      payload,
      status_code: statusCode,
      response_body: responseBody,
      error: errMsg,
      delivered_at: statusCode && statusCode >= 200 && statusCode < 300 ? new Date().toISOString() : null,
    });

    return new Response(JSON.stringify({ success: !errMsg && (statusCode ?? 0) < 400, status_code: statusCode }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("notify-workspace error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "internal" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
