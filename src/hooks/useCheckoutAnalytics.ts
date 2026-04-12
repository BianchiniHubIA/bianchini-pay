import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "./useOrganization";

export interface CheckoutStats {
  checkoutPageId: string;
  slug: string;
  offerName: string;
  productName: string;
  pageViews: number;
  uniqueVisitors: number;
  ctaClicks: number;
  purchases: number;
  conversionRate: number;
  clickRate: number;
}

export function useCheckoutAnalytics(days?: number) {
  const { organizationId } = useOrganization();

  return useQuery({
    queryKey: ["checkout-analytics", organizationId, days],
    queryFn: async (): Promise<CheckoutStats[]> => {
      if (!organizationId) return [];

      const { data: pages, error: pagesErr } = await supabase
        .from("checkout_pages")
        .select("id, slug, offer_id")
        .eq("organization_id", organizationId);

      if (pagesErr) throw pagesErr;
      if (!pages?.length) return [];

      const offerIds = [...new Set(pages.map((p) => p.offer_id))];
      const { data: offers } = await supabase.from("offers").select("id, name, product_id").in("id", offerIds);

      const productIds = [...new Set((offers ?? []).map((o) => o.product_id))];
      const { data: products } = await supabase.from("products").select("id, name").in("id", productIds.length ? productIds : ["_"]);

      const offerMap = new Map((offers ?? []).map((o) => [o.id, o]));
      const productMap = new Map((products ?? []).map((p) => [p.id, p.name]));

      const pageIds = pages.map((p) => p.id);
      let query = supabase
        .from("checkout_events")
        .select("checkout_page_id, event_type, visitor_id")
        .in("checkout_page_id", pageIds);

      if (days) {
        query = query.gte("created_at", new Date(Date.now() - days * 86400000).toISOString());
      }

      const { data: events, error: eventsErr } = await query;
      if (eventsErr) throw eventsErr;

      return pages.map((page) => {
        const pageEvents = (events ?? []).filter((e) => e.checkout_page_id === page.id);
        const views = pageEvents.filter((e) => e.event_type === "page_view");
        const clicks = pageEvents.filter((e) => e.event_type === "cta_click");
        const purchases = pageEvents.filter((e) => e.event_type === "purchase");
        const uniqueVisitors = new Set(views.map((e) => e.visitor_id).filter(Boolean)).size;

        const offer = offerMap.get(page.offer_id);
        const productName = offer ? (productMap.get(offer.product_id) ?? "—") : "—";

        return {
          checkoutPageId: page.id,
          slug: page.slug,
          offerName: offer?.name ?? "—",
          productName,
          pageViews: views.length,
          uniqueVisitors,
          ctaClicks: clicks.length,
          purchases: purchases.length,
          conversionRate: views.length > 0 ? (purchases.length / views.length) * 100 : 0,
          clickRate: views.length > 0 ? (clicks.length / views.length) * 100 : 0,
        };
      });
    },
    enabled: !!organizationId,
  });
}

export function useCheckoutTimeline(checkoutPageId: string | null, days = 7) {
  return useQuery({
    queryKey: ["checkout-timeline", checkoutPageId, days],
    queryFn: async () => {
      if (!checkoutPageId) return [];
      const since = new Date(Date.now() - days * 86400000).toISOString();

      const { data, error } = await supabase
        .from("checkout_events")
        .select("event_type, created_at")
        .eq("checkout_page_id", checkoutPageId)
        .gte("created_at", since)
        .order("created_at", { ascending: true });

      if (error) throw error;

      const grouped = new Map<string, { views: number; clicks: number; purchases: number }>();
      for (let i = 0; i < days; i++) {
        const d = new Date(Date.now() - (days - 1 - i) * 86400000);
        const key = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
        grouped.set(key, { views: 0, clicks: 0, purchases: 0 });
      }

      for (const event of data ?? []) {
        const key = new Date(event.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
        const entry = grouped.get(key);
        if (!entry) continue;
        if (event.event_type === "page_view") entry.views++;
        else if (event.event_type === "cta_click") entry.clicks++;
        else if (event.event_type === "purchase") entry.purchases++;
      }

      return Array.from(grouped.entries()).map(([date, stats]) => ({ date, ...stats }));
    },
    enabled: !!checkoutPageId,
  });
}
