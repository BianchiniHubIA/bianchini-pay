import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "./useOrganization";

export function useFinanceiro() {
  const { organizationId } = useOrganization();

  const ordersQuery = useQuery({
    queryKey: ["financeiro-orders", organizationId],
    queryFn: async () => {
      if (!organizationId) return [];
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const { data, error } = await supabase
        .from("orders")
        .select("*, offers(name, product_id)")
        .eq("organization_id", organizationId)
        .eq("status", "paid")
        .gte("created_at", firstDay)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!organizationId,
  });

  const productsQuery = useQuery({
    queryKey: ["financeiro-products", organizationId],
    queryFn: async () => {
      if (!organizationId) return [];
      const { data, error } = await supabase
        .from("products")
        .select("id, name")
        .eq("organization_id", organizationId);
      if (error) throw error;
      return data;
    },
    enabled: !!organizationId,
  });

  const productMembersQuery = useQuery({
    queryKey: ["product-members", organizationId],
    queryFn: async () => {
      if (!organizationId) return [];
      const { data: products } = await supabase
        .from("products")
        .select("id")
        .eq("organization_id", organizationId);
      if (!products?.length) return [];
      const productIds = products.map((p) => p.id);
      const { data, error } = await supabase
        .from("product_members")
        .select("*, org_members(user_id, role)")
        .in("product_id", productIds);
      if (error) throw error;

      // Fetch profile names
      const userIds = [...new Set((data ?? []).map((pm: any) => pm.org_members?.user_id).filter(Boolean))];
      if (!userIds.length) return data ?? [];

      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", userIds);
      const nameMap = new Map((profiles ?? []).map((p) => [p.user_id, p.full_name]));

      return (data ?? []).map((pm: any) => ({
        ...pm,
        member_name: nameMap.get(pm.org_members?.user_id) ?? "Sem nome",
      }));
    },
    enabled: !!organizationId,
  });

  return {
    orders: ordersQuery.data ?? [],
    products: productsQuery.data ?? [],
    productMembers: productMembersQuery.data ?? [],
    isLoading: ordersQuery.isLoading || productsQuery.isLoading || productMembersQuery.isLoading,
    refetch: () => {
      ordersQuery.refetch();
      productsQuery.refetch();
      productMembersQuery.refetch();
    },
  };
}
