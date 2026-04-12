
CREATE OR REPLACE FUNCTION public.create_org_on_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_org_id UUID;
  has_invite BOOLEAN;
  user_name TEXT;
BEGIN
  -- Check if user already got an org via invite trigger
  SELECT EXISTS(
    SELECT 1 FROM public.org_members WHERE user_id = NEW.id
  ) INTO has_invite;

  IF NOT has_invite THEN
    user_name := COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1)
    );

    INSERT INTO public.organizations (name, slug)
    VALUES (
      user_name || '''s Org',
      'org-' || substr(gen_random_uuid()::text, 1, 8)
    )
    RETURNING id INTO new_org_id;

    INSERT INTO public.org_members (user_id, organization_id, role)
    VALUES (NEW.id, new_org_id, 'owner');
  END IF;

  -- Create profile
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''))
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Drop existing trigger if any, then create
DROP TRIGGER IF EXISTS on_auth_user_created_create_org ON auth.users;
CREATE TRIGGER on_auth_user_created_create_org
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_org_on_signup();
