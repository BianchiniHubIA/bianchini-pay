import { supabase } from "@/integrations/supabase/client";
import { useEffect, useRef } from "react";

function getVisitorId(): string {
  const key = "af_visitor_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

function getUtmParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get("utm_source"),
    utm_medium: params.get("utm_medium"),
    utm_campaign: params.get("utm_campaign"),
  };
}

export function useTrackEvent(checkoutPageId: string | undefined) {
  const tracked = useRef(false);

  const track = async (eventType: "page_view" | "cta_click" | "purchase" | "lead_captured" | "payment_initiated" | "payment_approved") => {
    if (!checkoutPageId) return;
    const utms = getUtmParams();
    try {
      await supabase.from("checkout_events").insert({
        checkout_page_id: checkoutPageId,
        event_type: eventType,
        visitor_id: getVisitorId(),
        referrer: document.referrer || null,
        utm_source: utms.utm_source,
        utm_medium: utms.utm_medium,
        utm_campaign: utms.utm_campaign,
      });
    } catch {
      // Silent fail — tracking should never break the checkout
    }
  };

  // Auto-track page view once
  useEffect(() => {
    if (checkoutPageId && !tracked.current) {
      tracked.current = true;
      track("page_view");
    }
  }, [checkoutPageId]);

  return { track };
}
