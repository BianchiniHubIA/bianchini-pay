
CREATE TABLE public.team_invites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'editor',
  status TEXT NOT NULL DEFAULT 'pending',
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.team_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view invites"
  ON public.team_invites FOR SELECT TO authenticated
  USING (organization_id IN (SELECT public.get_user_org_ids(auth.uid())));

CREATE POLICY "Org members can insert invites"
  ON public.team_invites FOR INSERT TO authenticated
  WITH CHECK (organization_id IN (SELECT public.get_user_org_ids(auth.uid())));

CREATE POLICY "Org members can update invites"
  ON public.team_invites FOR UPDATE TO authenticated
  USING (organization_id IN (SELECT public.get_user_org_ids(auth.uid())));

CREATE POLICY "Org members can delete invites"
  ON public.team_invites FOR DELETE TO authenticated
  USING (organization_id IN (SELECT public.get_user_org_ids(auth.uid())));

CREATE INDEX idx_team_invites_email ON public.team_invites(email);
CREATE INDEX idx_team_invites_org ON public.team_invites(organization_id);

-- Function to auto-accept invite on signup
CREATE OR REPLACE FUNCTION public.accept_invite_on_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  invite RECORD;
BEGIN
  -- Find pending invite for this email
  SELECT * INTO invite FROM public.team_invites 
  WHERE email = NEW.email AND status = 'pending' 
  LIMIT 1;

  IF invite IS NOT NULL THEN
    -- Add user to org
    INSERT INTO public.org_members (user_id, organization_id, role)
    VALUES (NEW.id, invite.organization_id, invite.role::app_role)
    ON CONFLICT DO NOTHING;

    -- Mark invite as accepted
    UPDATE public.team_invites SET status = 'accepted', updated_at = now() WHERE id = invite.id;
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger on auth.users insert
CREATE TRIGGER on_auth_user_created_accept_invite
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.accept_invite_on_signup();
