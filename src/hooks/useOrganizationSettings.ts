import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "./useOrganization";
import type { Tables, TablesUpdate } from "@/integrations/supabase/types";

export type Organization = Tables<"organizations">;
export type OrgMember = Tables<"org_members">;

export function useOrganizationDetails() {
  const { organizationId } = useOrganization();

  return useQuery({
    queryKey: ["organization", organizationId],
    queryFn: async () => {
      if (!organizationId) return null;
      const { data, error } = await supabase
        .from("organizations")
        .select("*")
        .eq("id", organizationId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!organizationId,
  });
}

export function useUpdateOrganization() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<"organizations"> & { id: string }) => {
      const { data, error } = await supabase
        .from("organizations")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["organization"] }),
  });
}

export type MemberWithProfile = OrgMember & { full_name: string | null };

export function useOrgMembers() {
  const { organizationId } = useOrganization();

  return useQuery({
    queryKey: ["org-members", organizationId],
    queryFn: async () => {
      if (!organizationId) return [] as MemberWithProfile[];
      const { data: members, error } = await supabase
        .from("org_members")
        .select("*")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: true });
      if (error) throw error;

      const userIds = (members ?? []).map((m) => m.user_id);
      if (!userIds.length) return [] as MemberWithProfile[];

      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", userIds);

      const profileMap = new Map((profiles ?? []).map((p) => [p.user_id, p.full_name]));

      return (members ?? []).map((m) => ({
        ...m,
        full_name: profileMap.get(m.user_id) ?? null,
      }));
    },
    enabled: !!organizationId,
  });
}

export function useUpdateMemberRole() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, role }: { id: string; role: "owner" | "admin" | "editor" | "viewer" }) => {
      const { error } = await supabase
        .from("org_members")
        .update({ role })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["org-members"] }),
  });
}

export function useRemoveMember() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("org_members").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["org-members"] }),
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, fullName }: { userId: string; fullName: string }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName })
        .eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["org-members"] }),
  });
}
