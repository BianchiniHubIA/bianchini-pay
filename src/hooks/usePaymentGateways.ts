import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "./useOrganization";
import { toast } from "@/hooks/use-toast";

export interface PaymentGateway {
  id: string;
  organization_id: string;
  provider: string;
  display_name: string;
  is_active: boolean;
  is_primary: boolean;
  environment: string;
  credentials: Record<string, string>;
  priority: number;
  created_at: string;
  updated_at: string;
}

export function usePaymentGateways() {
  const { organizationId } = useOrganization();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["payment_gateways", organizationId],
    queryFn: async () => {
      if (!organizationId) return [];
      const { data, error } = await supabase
        .from("payment_gateways")
        .select("*")
        .eq("organization_id", organizationId)
        .order("priority", { ascending: true });
      if (error) throw error;
      return data as PaymentGateway[];
    },
    enabled: !!organizationId,
  });

  const upsertGateway = useMutation({
    mutationFn: async (gateway: Partial<PaymentGateway> & { provider: string; display_name: string }) => {
      if (!organizationId) throw new Error("Sem organização");
      const payload = { ...gateway, organization_id: organizationId, updated_at: new Date().toISOString() };
      if (gateway.id) {
        const { error } = await supabase.from("payment_gateways").update(payload).eq("id", gateway.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("payment_gateways").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment_gateways", organizationId] });
      toast({ title: "Gateway salvo com sucesso" });
    },
    onError: (e: any) => toast({ title: "Erro ao salvar gateway", description: e.message, variant: "destructive" }),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("payment_gateways").update({ is_active, updated_at: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment_gateways", organizationId] });
    },
  });

  const setPrimary = useMutation({
    mutationFn: async (id: string) => {
      if (!organizationId) return;
      // Remove primary from all
      await supabase.from("payment_gateways").update({ is_primary: false }).eq("organization_id", organizationId);
      // Set new primary
      const { error } = await supabase.from("payment_gateways").update({ is_primary: true, is_active: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment_gateways", organizationId] });
      toast({ title: "Gateway principal atualizado" });
    },
  });

  const deleteGateway = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("payment_gateways").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment_gateways", organizationId] });
      toast({ title: "Gateway removido" });
    },
  });

  return { ...query, upsertGateway, toggleActive, setPrimary, deleteGateway };
}
