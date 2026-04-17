
-- Function: invite or add member directly if account exists
CREATE OR REPLACE FUNCTION public.invite_or_add_member(
  _organization_id uuid,
  _email text,
  _role app_role
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _existing_user_id uuid;
  _result jsonb;
BEGIN
  -- Authorization: only owner/admin of the org can call this
  IF NOT has_org_role(auth.uid(), _organization_id, ARRAY['owner'::app_role, 'admin'::app_role]) THEN
    RAISE EXCEPTION 'Sem permissão para adicionar membros nesta organização';
  END IF;

  -- Find user by email in auth.users
  SELECT id INTO _existing_user_id
  FROM auth.users
  WHERE lower(email) = lower(_email)
  LIMIT 1;

  IF _existing_user_id IS NOT NULL THEN
    -- Already a member?
    IF EXISTS (
      SELECT 1 FROM org_members
      WHERE organization_id = _organization_id AND user_id = _existing_user_id
    ) THEN
      RAISE EXCEPTION 'Este usuário já é membro da organização';
    END IF;

    INSERT INTO org_members (organization_id, user_id, role)
    VALUES (_organization_id, _existing_user_id, _role);

    _result := jsonb_build_object('status', 'added', 'user_id', _existing_user_id);
  ELSE
    -- Create or update pending invite
    IF EXISTS (
      SELECT 1 FROM team_invites
      WHERE organization_id = _organization_id
        AND lower(email) = lower(_email)
        AND status = 'pending'
    ) THEN
      RAISE EXCEPTION 'Já existe um convite pendente para este email';
    END IF;

    INSERT INTO team_invites (organization_id, email, role, invited_by, status)
    VALUES (_organization_id, lower(_email), _role::text, auth.uid(), 'pending');

    _result := jsonb_build_object('status', 'invited');
  END IF;

  RETURN _result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.invite_or_add_member(uuid, text, app_role) TO authenticated;

-- Trigger function: on new user signup, accept any pending invites by email
CREATE OR REPLACE FUNCTION public.accept_pending_invites_on_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _invite RECORD;
BEGIN
  FOR _invite IN
    SELECT * FROM public.team_invites
    WHERE lower(email) = lower(NEW.email)
      AND status = 'pending'
  LOOP
    -- Insert membership if not already a member
    IF NOT EXISTS (
      SELECT 1 FROM public.org_members
      WHERE organization_id = _invite.organization_id AND user_id = NEW.id
    ) THEN
      INSERT INTO public.org_members (organization_id, user_id, role)
      VALUES (_invite.organization_id, NEW.id, _invite.role::app_role);
    END IF;

    UPDATE public.team_invites
    SET status = 'accepted', updated_at = now()
    WHERE id = _invite.id;
  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_accept_invites ON auth.users;
CREATE TRIGGER on_auth_user_created_accept_invites
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.accept_pending_invites_on_signup();
