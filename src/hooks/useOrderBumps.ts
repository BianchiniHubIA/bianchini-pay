import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface OrderBump {
  id: string;
  checkout_page_id: string;
  offer_id: string;
  title: string;
  description: string | null;
  display_price_cents: number;
  is_active: boolean;
  sort_order: number;
  offers?: { name: string; price_cents: number } | null;
}

export function useOrderBumps(checkoutPageId: string | null) {
  return useQuery({
    queryKey: ["order-bumps", checkoutPageId],
    queryFn: async () => {
      if (!checkoutPageId) return [];
      const { data, error } = await supabase
        .from("order_bumps")
        .select("*, offers(name, price_cents)")
        .eq("checkout_page_id", checkoutPageId)
        .order("sort_order");
      if (error) throw error;
      return data as OrderBump[];
    },
    enabled: !!checkoutPageId,
  });
}

export function useCreateOrderBump() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: {
      checkout_page_id: string;
      offer_id: string;
      title: string;
      description?: string | null;
      display_price_cents: number;
    }) => {
      const { error } = await supabase.from("order_bumps").insert(values);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["order-bumps"] }),
  });
}

export function useDeleteOrderBump() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("order_bumps").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["order-bumps"] }),
  });
}

export function useToggleOrderBump() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("order_bumps").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["order-bumps"] }),
  });
}
