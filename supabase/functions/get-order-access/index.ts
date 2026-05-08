import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const WORKSPACE_URL = Deno.env.get("WORKSPACE_URL") ?? "";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const orderId = url.searchParams.get("order_id");
    if (!orderId || !/^[0-9a-f-]{36}$/i.test(orderId)) {
      return new Response(JSON.stringify({ error: "invalid order_id" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: order } = await supabase
      .from("orders")
      .select("status, workspace_access, offer_id")
      .eq("id", orderId)
      .maybeSingle();

    if (!order) {
      return new Response(JSON.stringify({ error: "not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if linked product has workspace release configured
    let workspace_enabled = false;
    if (order.offer_id) {
      const { data: offer } = await supabase
        .from("offers")
        .select("products:product_id(workspace_course_id)")
        .eq("id", order.offer_id)
        .maybeSingle();
      workspace_enabled = !!(offer as any)?.products?.workspace_course_id;
    }

    const baseUrl = (WORKSPACE_URL || "").replace(/\/+$/, "");
    const loginUrl = baseUrl ? `${baseUrl}/auth` : null;

    return new Response(
      JSON.stringify({
        status: order.status,
        workspace_enabled,
        workspace_url: loginUrl,
        workspace_access: order.workspace_access ?? null,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "internal" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
