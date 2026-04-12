import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "./useOrganization";
import { subDays, format, startOfDay } from "date-fns";

export function useRevenueOverTime(days = 30) {
  const { organizationId } = useOrganization();

  return useQuery({
    queryKey: ["analytics-revenue", organizationId, days],
    queryFn: async () => {
      if (!organizationId) return [];

      const since = subDays(new Date(), days).toISOString();
      const { data, error } = await supabase
        .from("orders")
        .select("amount_cents, status, created_at")
        .eq("organization_id", organizationId)
        .eq("status", "paid")
        .gte("created_at", since)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Group by day
      const grouped = new Map<string, number>();
      for (let i = 0; i < days; i++) {
        const key = format(subDays(new Date(), days - 1 - i), "dd/MM");
        grouped.set(key, 0);
      }

      for (const order of data ?? []) {
        const key = format(new Date(order.created_at), "dd/MM");
        grouped.set(key, (grouped.get(key) ?? 0) + order.amount_cents);
      }

      return Array.from(grouped.entries()).map(([date, amount]) => ({
        date,
        amount: amount / 100,
      }));
    },
    enabled: !!organizationId,
  });
}

export function useOrdersByStatus() {
  const { organizationId } = useOrganization();

  return useQuery({
    queryKey: ["analytics-orders-status", organizationId],
    queryFn: async () => {
      if (!organizationId) return [];

      const { data, error } = await supabase
        .from("orders")
        .select("status")
        .eq("organization_id", organizationId);

      if (error) throw error;

      const counts: Record<string, number> = {};
      for (const order of data ?? []) {
        counts[order.status] = (counts[order.status] ?? 0) + 1;
      }

      const labels: Record<string, string> = {
        paid: "Pago",
        pending: "Pendente",
        refunded: "Reembolsado",
        cancelled: "Cancelado",
        expired: "Expirado",
      };

      const colors: Record<string, string> = {
        paid: "hsl(142, 71%, 45%)",
        pending: "hsl(38, 92%, 50%)",
        refunded: "hsl(220, 14%, 50%)",
        cancelled: "hsl(0, 72%, 51%)",
        expired: "hsl(220, 10%, 70%)",
      };

      return Object.entries(counts).map(([status, count]) => ({
        name: labels[status] ?? status,
        value: count,
        fill: colors[status] ?? "hsl(220, 80%, 56%)",
      }));
    },
    enabled: !!organizationId,
  });
}

export function useTopProducts(limit = 5) {
  const { organizationId } = useOrganization();

  return useQuery({
    queryKey: ["analytics-top-products", organizationId, limit],
    queryFn: async () => {
      if (!organizationId) return [];

      const { data: orders, error } = await supabase
        .from("orders")
        .select("amount_cents, offer_id")
        .eq("organization_id", organizationId)
        .eq("status", "paid");

      if (error) throw error;

      // Group by offer
      const offerTotals = new Map<string, number>();
      for (const o of orders ?? []) {
        if (!o.offer_id) continue;
        offerTotals.set(o.offer_id, (offerTotals.get(o.offer_id) ?? 0) + o.amount_cents);
      }

      const offerIds = Array.from(offerTotals.keys());
      if (!offerIds.length) return [];

      const { data: offers } = await supabase
        .from("offers")
        .select("id, name")
        .in("id", offerIds);

      const nameMap = new Map((offers ?? []).map((o) => [o.id, o.name]));

      return Array.from(offerTotals.entries())
        .map(([id, total]) => ({ name: nameMap.get(id) ?? "Oferta", revenue: total / 100 }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, limit);
    },
    enabled: !!organizationId,
  });
}
