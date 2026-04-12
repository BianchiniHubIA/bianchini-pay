
-- 1. Enum types
CREATE TYPE public.app_role AS ENUM ('owner', 'admin', 'editor', 'viewer');
CREATE TYPE public.product_type AS ENUM ('digital', 'physical', 'service');
CREATE TYPE public.product_status AS ENUM ('active', 'inactive', 'draft');
CREATE TYPE public.billing_type AS ENUM ('one_time', 'recurring');
CREATE TYPE public.billing_interval AS ENUM ('monthly', 'quarterly', 'semiannual', 'annual');
CREATE TYPE public.order_status AS ENUM ('pending', 'paid', 'refunded', 'cancelled', 'expired');

-- 2. Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3. Organizations
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- 4. Org Members
CREATE TABLE public.org_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (organization_id, user_id)
);
ALTER TABLE public.org_members ENABLE ROW LEVEL SECURITY;

-- 5. Security definer function to check org membership (avoids recursion)
CREATE OR REPLACE FUNCTION public.get_user_org_ids(_user_id UUID)
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id FROM public.org_members WHERE user_id = _user_id;
$$;

CREATE OR REPLACE FUNCTION public.has_org_role(_user_id UUID, _org_id UUID, _roles app_role[])
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.org_members
    WHERE user_id = _user_id
      AND organization_id = _org_id
      AND role = ANY(_roles)
  );
$$;

-- Org policies
CREATE POLICY "Members can view their orgs" ON public.organizations FOR SELECT
  USING (id IN (SELECT public.get_user_org_ids(auth.uid())));
CREATE POLICY "Owners can update their org" ON public.organizations FOR UPDATE
  USING (public.has_org_role(auth.uid(), id, ARRAY['owner'::app_role, 'admin'::app_role]));

-- Org members policies
CREATE POLICY "Members can view org members" ON public.org_members FOR SELECT
  USING (organization_id IN (SELECT public.get_user_org_ids(auth.uid())));
CREATE POLICY "Owners can manage members" ON public.org_members FOR INSERT
  WITH CHECK (public.has_org_role(auth.uid(), organization_id, ARRAY['owner'::app_role, 'admin'::app_role]));
CREATE POLICY "Owners can update members" ON public.org_members FOR UPDATE
  USING (public.has_org_role(auth.uid(), organization_id, ARRAY['owner'::app_role, 'admin'::app_role]));
CREATE POLICY "Owners can delete members" ON public.org_members FOR DELETE
  USING (public.has_org_role(auth.uid(), organization_id, ARRAY['owner'::app_role, 'admin'::app_role]));

-- 6. Products
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  type public.product_type NOT NULL DEFAULT 'digital',
  status public.product_status NOT NULL DEFAULT 'draft',
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view products" ON public.products FOR SELECT
  USING (organization_id IN (SELECT public.get_user_org_ids(auth.uid())));
CREATE POLICY "Editors+ can create products" ON public.products FOR INSERT
  WITH CHECK (public.has_org_role(auth.uid(), organization_id, ARRAY['owner'::app_role, 'admin'::app_role, 'editor'::app_role]));
CREATE POLICY "Editors+ can update products" ON public.products FOR UPDATE
  USING (public.has_org_role(auth.uid(), organization_id, ARRAY['owner'::app_role, 'admin'::app_role, 'editor'::app_role]));
CREATE POLICY "Admins+ can delete products" ON public.products FOR DELETE
  USING (public.has_org_role(auth.uid(), organization_id, ARRAY['owner'::app_role, 'admin'::app_role]));

-- 7. Offers
CREATE TABLE public.offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  price_cents INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'BRL',
  billing_type public.billing_type NOT NULL DEFAULT 'one_time',
  billing_interval public.billing_interval,
  installments INTEGER DEFAULT 1,
  trial_days INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view offers" ON public.offers FOR SELECT
  USING (organization_id IN (SELECT public.get_user_org_ids(auth.uid())));
CREATE POLICY "Editors+ can create offers" ON public.offers FOR INSERT
  WITH CHECK (public.has_org_role(auth.uid(), organization_id, ARRAY['owner'::app_role, 'admin'::app_role, 'editor'::app_role]));
CREATE POLICY "Editors+ can update offers" ON public.offers FOR UPDATE
  USING (public.has_org_role(auth.uid(), organization_id, ARRAY['owner'::app_role, 'admin'::app_role, 'editor'::app_role]));
CREATE POLICY "Admins+ can delete offers" ON public.offers FOR DELETE
  USING (public.has_org_role(auth.uid(), organization_id, ARRAY['owner'::app_role, 'admin'::app_role]));

-- 8. Customers
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  document TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view customers" ON public.customers FOR SELECT
  USING (organization_id IN (SELECT public.get_user_org_ids(auth.uid())));
CREATE POLICY "Editors+ can create customers" ON public.customers FOR INSERT
  WITH CHECK (public.has_org_role(auth.uid(), organization_id, ARRAY['owner'::app_role, 'admin'::app_role, 'editor'::app_role]));
CREATE POLICY "Editors+ can update customers" ON public.customers FOR UPDATE
  USING (public.has_org_role(auth.uid(), organization_id, ARRAY['owner'::app_role, 'admin'::app_role, 'editor'::app_role]));

-- 9. Orders
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  offer_id UUID REFERENCES public.offers(id) ON DELETE SET NULL,
  status public.order_status NOT NULL DEFAULT 'pending',
  amount_cents INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'BRL',
  payment_method TEXT,
  external_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view orders" ON public.orders FOR SELECT
  USING (organization_id IN (SELECT public.get_user_org_ids(auth.uid())));
CREATE POLICY "System can create orders" ON public.orders FOR INSERT
  WITH CHECK (organization_id IN (SELECT public.get_user_org_ids(auth.uid())));

-- 10. Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_offers_updated_at BEFORE UPDATE ON public.offers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 11. Auto-create profile + org on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  _org_id UUID;
  _slug TEXT;
BEGIN
  -- Create profile
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');

  -- Generate unique slug
  _slug := lower(replace(coalesce(NEW.raw_user_meta_data ->> 'full_name', split_part(NEW.email, '@', 1)), ' ', '-')) || '-' || substr(gen_random_uuid()::text, 1, 8);

  -- Create organization
  INSERT INTO public.organizations (name, slug)
  VALUES (coalesce(NEW.raw_user_meta_data ->> 'full_name', split_part(NEW.email, '@', 1)) || '''s Org', _slug)
  RETURNING id INTO _org_id;

  -- Add user as owner
  INSERT INTO public.org_members (organization_id, user_id, role)
  VALUES (_org_id, NEW.id, 'owner');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 12. Indexes
CREATE INDEX idx_products_org ON public.products(organization_id);
CREATE INDEX idx_offers_product ON public.offers(product_id);
CREATE INDEX idx_offers_org ON public.offers(organization_id);
CREATE INDEX idx_customers_org ON public.customers(organization_id);
CREATE INDEX idx_orders_org ON public.orders(organization_id);
CREATE INDEX idx_orders_customer ON public.orders(customer_id);
CREATE INDEX idx_org_members_user ON public.org_members(user_id);
CREATE INDEX idx_org_members_org ON public.org_members(organization_id);
