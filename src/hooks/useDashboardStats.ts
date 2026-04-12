import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "./useOrganization";

export function useDashboardStats() {
  const { organizationId } = useOrganization();

  return useQuery({
    queryKey: ["dashboard-stats", organizationId],
    queryFn: async () => {
      if (!organizationId) return { revenue: 0, orders: 0, customers: 0, products: 0 };

      const [ordersRes, customersRes, productsRes] = await Promise.all([
        supabase
          .from("orders")
          .select("amount_cents, status")
          .eq("organization_id", organizationId),
        supabase
          .from("customers")
          .select("id", { count: "exact", head: true })
          .eq("organization_id", organizationId),
        supabase
          .from("products")
          .select("id", { count: "exact", head: true })
          .eq("organization_id", organizationId),
      ]);

      const paidOrders = ordersRes.data?.filter((o) => o.status === "paid") ?? [];
      const revenue = paidOrders.reduce((sum, o) => sum + o.amount_cents, 0);

      return {
        revenue,
        orders: ordersRes.data?.length ?? 0,
        customers: customersRes.count ?? 0,
        products: productsRes.count ?? 0,
      };
    },
    enabled: !!organizationId,
  });
}
