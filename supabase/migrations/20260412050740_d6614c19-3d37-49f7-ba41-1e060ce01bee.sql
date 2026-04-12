
CREATE TABLE public.team_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'viewer',
  status TEXT NOT NULL DEFAULT 'pending',
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.team_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view team invites" ON public.team_invites FOR SELECT TO authenticated
  USING (organization_id IN (SELECT public.get_user_org_ids(auth.uid())));

CREATE POLICY "Admins can create team invites" ON public.team_invites FOR INSERT TO authenticated
  WITH CHECK (public.has_org_role(auth.uid(), organization_id, ARRAY['owner'::app_role, 'admin'::app_role]));

CREATE POLICY "Admins can update team invites" ON public.team_invites FOR UPDATE TO authenticated
  USING (public.has_org_role(auth.uid(), organization_id, ARRAY['owner'::app_role, 'admin'::app_role]));

CREATE POLICY "Admins can delete team invites" ON public.team_invites FOR DELETE TO authenticated
  USING (public.has_org_role(auth.uid(), organization_id, ARRAY['owner'::app_role, 'admin'::app_role]));

CREATE TRIGGER update_team_invites_updated_at BEFORE UPDATE ON public.team_invites
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
