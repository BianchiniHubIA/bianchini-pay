import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "./useOrganization";

export function useLeads(productId?: string | null) {
  const { organizationId } = useOrganization();

  return useQuery({
    queryKey: ["leads", organizationId, productId],
    queryFn: async () => {
      if (!organizationId) return [];
      let query = supabase
        .from("leads")
        .select("*, products(name), offers(name, price_cents)")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false });

      if (productId) {
        query = query.eq("product_id", productId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!organizationId,
  });
}
