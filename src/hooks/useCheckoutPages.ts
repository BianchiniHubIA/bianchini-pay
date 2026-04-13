import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "./useOrganization";

export interface CheckoutPage {
  id: string;
  offer_id: string;
  organization_id: string;
  slug: string;
  template: string;
  headline: string;
  subheadline: string | null;
  description: string | null;
  cta_text: string;
  primary_color: string;
  bg_color: string;
  accent_color: string | null;
  image_url: string | null;
  logo_url: string | null;
  show_guarantee: boolean;
  guarantee_text: string | null;
  fb_pixel_id: string | null;
  ga_tracking_id: string | null;
  gtm_id: string | null;
  custom_scripts: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export function useCheckoutPageByOffer(offerId: string | null) {
  return useQuery({
    queryKey: ["checkout-page", offerId],
    queryFn: async () => {
      if (!offerId) return null;
      const { data, error } = await supabase
        .from("checkout_pages")
        .select("*")
        .eq("offer_id", offerId)
        .maybeSingle();
      if (error) throw error;
      return data as CheckoutPage | null;
    },
    enabled: !!offerId,
  });
}

export function useCheckoutPageBySlug(slug: string | null) {
  return useQuery({
    queryKey: ["checkout-page-slug", slug],
    queryFn: async () => {
      if (!slug) return null;
      const { data, error } = await supabase
        .from("public_checkout_pages" as any)
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();
      if (error) throw error;
      return data as CheckoutPage | null;
    },
    enabled: !!slug,
  });
}

export function useUpsertCheckoutPage() {
  const qc = useQueryClient();
  const { organizationId } = useOrganization();

  return useMutation({
    mutationFn: async (page: Partial<CheckoutPage> & { offer_id: string; slug: string }) => {
      if (!organizationId) throw new Error("Sem organização");

      const payload = { ...page, organization_id: organizationId };

      if (page.id) {
        const { data, error } = await supabase
          .from("checkout_pages")
          .update(payload)
          .eq("id", page.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from("checkout_pages")
          .insert(payload)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["checkout-page", vars.offer_id] });
      qc.invalidateQueries({ queryKey: ["checkout-page-slug"] });
    },
  });
}

export function useDeleteCheckoutPage() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("checkout_pages").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["checkout-page"] });
    },
  });
}
