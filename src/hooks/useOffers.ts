import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "./useOrganization";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Offer = Tables<"offers">;

export function useOffersByProduct(productId: string | null) {
  return useQuery({
    queryKey: ["offers", productId],
    queryFn: async () => {
      if (!productId) return [];
      const { data, error } = await supabase
        .from("offers")
        .select("*")
        .eq("product_id", productId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!productId,
  });
}

export function useCreateOffer() {
  const qc = useQueryClient();
  const { organizationId } = useOrganization();

  return useMutation({
    mutationFn: async (offer: Omit<TablesInsert<"offers">, "organization_id">) => {
      if (!organizationId) throw new Error("Organização não carregada. Tente novamente.");
      const { data, error } = await supabase
        .from("offers")
        .insert({ ...offer, organization_id: organizationId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ["offers", vars.product_id] }),
  });
}

export function useUpdateOffer() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<"offers"> & { id: string }) => {
      const { data, error } = await supabase
        .from("offers")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["offers"] }),
  });
}

export function useDeleteOffer() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("offers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["offers"] }),
  });
}
