import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useOrganization() {
  const { user } = useAuth();
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setOrganizationId(null);
      setLoading(false);
      return;
    }

    const fetchOrg = async () => {
      const { data } = await supabase
        .from("org_members")
        .select("organization_id")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();

      setOrganizationId(data?.organization_id ?? null);
      setLoading(false);
    };

    fetchOrg();
  }, [user]);

  return { organizationId, loading };
}
