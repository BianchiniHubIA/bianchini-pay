import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "./useOrganization";

export function useCoupons() {
  const { organizationId } = useOrganization();

  const query = useQuery({
    queryKey: ["coupons", organizationId],
    queryFn: async () => {
      if (!organizationId) return [];
      const { data, error } = await supabase
        .from("coupons")
        .select("*, products(name)")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!organizationId,
  });

  return query;
}

export function useCreateCoupon() {
  const qc = useQueryClient();
  const { organizationId } = useOrganization();

  return useMutation({
    mutationFn: async (values: {
      code: string;
      product_id: string | null;
      discount_percent: number;
      starts_at: string | null;
      expires_at: string | null;
      apply_to_bumps: boolean;
    }) => {
      if (!organizationId) throw new Error("Sem organização");
      const { error } = await supabase.from("coupons").insert({
        organization_id: organizationId,
        code: values.code.toUpperCase(),
        product_id: values.product_id || null,
        discount_percent: values.discount_percent,
        starts_at: values.starts_at || null,
        expires_at: values.expires_at || null,
        apply_to_bumps: values.apply_to_bumps,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["coupons"] }),
  });
}

export function useDeleteCoupon() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("coupons").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["coupons"] }),
  });
}
