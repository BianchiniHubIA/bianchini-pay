
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

-- 5. Security definer functions
CREATE OR REPLACE FUNCTION public.get_user_org_ids(_user_id UUID)
RETURNS SETOF UUID LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT organization_id FROM public.org_members WHERE user_id = _user_id;
$$;

CREATE OR REPLACE FUNCTION public.has_org_role(_user_id UUID, _org_id UUID, _roles app_role[])
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.org_members WHERE user_id = _user_id AND organization_id = _org_id AND role = ANY(_roles)
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
  access_type TEXT DEFAULT 'link',
  sales_page_url TEXT,
  support_email TEXT,
  producer_name TEXT,
  guarantee_days INTEGER DEFAULT 7,
  fb_pixel_id TEXT,
  ga_tracking_id TEXT,
  google_ads_id TEXT,
  meta_ads_id TEXT,
  require_address BOOLEAN DEFAULT false,
  show_coupon_field BOOLEAN DEFAULT false,
  require_email_confirm BOOLEAN DEFAULT false,
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
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_offers_updated_at BEFORE UPDATE ON public.offers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 11. Checkout pages
CREATE TABLE public.checkout_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  offer_id UUID NOT NULL REFERENCES public.offers(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  template TEXT NOT NULL DEFAULT 'classic',
  headline TEXT NOT NULL DEFAULT 'Adquira agora',
  subheadline TEXT,
  description TEXT,
  cta_text TEXT NOT NULL DEFAULT 'Comprar agora',
  primary_color TEXT NOT NULL DEFAULT '#3366FF',
  bg_color TEXT NOT NULL DEFAULT '#FFFFFF',
  accent_color TEXT,
  image_url TEXT,
  logo_url TEXT,
  show_guarantee BOOLEAN NOT NULL DEFAULT false,
  guarantee_text TEXT DEFAULT '7 dias de garantia',
  fb_pixel_id TEXT,
  ga_tracking_id TEXT,
  gtm_id TEXT,
  custom_scripts TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.checkout_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view checkout pages" ON public.checkout_pages FOR SELECT
  USING (organization_id IN (SELECT get_user_org_ids(auth.uid())));
CREATE POLICY "Editors+ can create checkout pages" ON public.checkout_pages FOR INSERT
  WITH CHECK (has_org_role(auth.uid(), organization_id, ARRAY['owner'::app_role, 'admin'::app_role, 'editor'::app_role]));
CREATE POLICY "Editors+ can update checkout pages" ON public.checkout_pages FOR UPDATE
  USING (has_org_role(auth.uid(), organization_id, ARRAY['owner'::app_role, 'admin'::app_role, 'editor'::app_role]));
CREATE POLICY "Admins+ can delete checkout pages" ON public.checkout_pages FOR DELETE
  USING (has_org_role(auth.uid(), organization_id, ARRAY['owner'::app_role, 'admin'::app_role]));
CREATE POLICY "Public can view published checkout pages" ON public.checkout_pages FOR SELECT TO anon USING (is_published = true);
CREATE TRIGGER update_checkout_pages_updated_at BEFORE UPDATE ON public.checkout_pages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_checkout_pages_slug ON public.checkout_pages(slug);
CREATE INDEX idx_checkout_pages_offer_id ON public.checkout_pages(offer_id);

-- 12. Checkout events
CREATE TABLE public.checkout_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  checkout_page_id UUID NOT NULL REFERENCES public.checkout_pages(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  visitor_id TEXT,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.checkout_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert events for published pages" ON public.checkout_events FOR INSERT TO anon, authenticated
  WITH CHECK (checkout_page_id IN (SELECT id FROM public.checkout_pages WHERE is_published = true));
CREATE POLICY "Members can view checkout events" ON public.checkout_events FOR SELECT TO authenticated
  USING (checkout_page_id IN (SELECT cp.id FROM public.checkout_pages cp WHERE cp.organization_id IN (SELECT get_user_org_ids(auth.uid()))));
CREATE INDEX idx_checkout_events_page_id ON public.checkout_events(checkout_page_id);
CREATE INDEX idx_checkout_events_type ON public.checkout_events(event_type);
CREATE INDEX idx_checkout_events_created_at ON public.checkout_events(created_at);
CREATE INDEX idx_checkout_events_visitor ON public.checkout_events(visitor_id);
ALTER TABLE public.checkout_events ADD CONSTRAINT checkout_events_valid_type CHECK (event_type IN ('page_view', 'cta_click', 'purchase', 'lead_captured'));

-- 13. Product members
CREATE TABLE public.product_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.org_members(id) ON DELETE CASCADE,
  percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(product_id, member_id)
);
ALTER TABLE public.product_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view product_members" ON public.product_members FOR SELECT
  USING (product_id IN (SELECT p.id FROM public.products p WHERE p.organization_id IN (SELECT get_user_org_ids(auth.uid()))));
CREATE POLICY "Admins can insert product_members" ON public.product_members FOR INSERT
  WITH CHECK (product_id IN (SELECT p.id FROM public.products p WHERE has_org_role(auth.uid(), p.organization_id, ARRAY['owner'::app_role, 'admin'::app_role])));
CREATE POLICY "Admins can update product_members" ON public.product_members FOR UPDATE
  USING (product_id IN (SELECT p.id FROM public.products p WHERE has_org_role(auth.uid(), p.organization_id, ARRAY['owner'::app_role, 'admin'::app_role])));
CREATE POLICY "Admins can delete product_members" ON public.product_members FOR DELETE
  USING (product_id IN (SELECT p.id FROM public.products p WHERE has_org_role(auth.uid(), p.organization_id, ARRAY['owner'::app_role, 'admin'::app_role])));

-- 14. Coupons
CREATE TABLE public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  code TEXT NOT NULL,
  discount_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
  starts_at DATE,
  expires_at DATE,
  max_uses INTEGER,
  used_count INTEGER NOT NULL DEFAULT 0,
  apply_to_bumps BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, code)
);
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view coupons" ON public.coupons FOR SELECT
  USING (organization_id IN (SELECT get_user_org_ids(auth.uid())));
CREATE POLICY "Editors+ can create coupons" ON public.coupons FOR INSERT
  WITH CHECK (has_org_role(auth.uid(), organization_id, ARRAY['owner'::app_role, 'admin'::app_role, 'editor'::app_role]));
CREATE POLICY "Editors+ can update coupons" ON public.coupons FOR UPDATE
  USING (has_org_role(auth.uid(), organization_id, ARRAY['owner'::app_role, 'admin'::app_role, 'editor'::app_role]));
CREATE POLICY "Admins+ can delete coupons" ON public.coupons FOR DELETE
  USING (has_org_role(auth.uid(), organization_id, ARRAY['owner'::app_role, 'admin'::app_role]));

-- 15. Order bumps
CREATE TABLE public.order_bumps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  checkout_page_id UUID NOT NULL REFERENCES public.checkout_pages(id) ON DELETE CASCADE,
  offer_id UUID NOT NULL REFERENCES public.offers(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Aproveite esta oferta!',
  description TEXT,
  display_price_cents INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.order_bumps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view order bumps" ON public.order_bumps FOR SELECT
  USING (checkout_page_id IN (SELECT cp.id FROM checkout_pages cp WHERE cp.organization_id IN (SELECT get_user_org_ids(auth.uid()))));
CREATE POLICY "Editors+ can create order bumps" ON public.order_bumps FOR INSERT
  WITH CHECK (checkout_page_id IN (SELECT cp.id FROM checkout_pages cp WHERE has_org_role(auth.uid(), cp.organization_id, ARRAY['owner'::app_role, 'admin'::app_role, 'editor'::app_role])));
CREATE POLICY "Editors+ can update order bumps" ON public.order_bumps FOR UPDATE
  USING (checkout_page_id IN (SELECT cp.id FROM checkout_pages cp WHERE has_org_role(auth.uid(), cp.organization_id, ARRAY['owner'::app_role, 'admin'::app_role, 'editor'::app_role])));
CREATE POLICY "Admins+ can delete order bumps" ON public.order_bumps FOR DELETE
  USING (checkout_page_id IN (SELECT cp.id FROM checkout_pages cp WHERE has_org_role(auth.uid(), cp.organization_id, ARRAY['owner'::app_role, 'admin'::app_role])));
CREATE POLICY "Public can view active bumps on published pages" ON public.order_bumps FOR SELECT TO anon
  USING (is_active = true AND checkout_page_id IN (SELECT cp.id FROM checkout_pages cp WHERE cp.is_published = true));

-- 16. Leads
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  checkout_page_id UUID REFERENCES public.checkout_pages(id) ON DELETE SET NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  offer_id UUID REFERENCES public.offers(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT,
  document TEXT,
  payment_method TEXT,
  status TEXT NOT NULL DEFAULT 'lead',
  converted_at TIMESTAMPTZ,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  referrer TEXT,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members can view leads" ON public.leads FOR SELECT TO authenticated
  USING (organization_id IN (SELECT public.get_user_org_ids(auth.uid())));
CREATE POLICY "Org members can insert leads" ON public.leads FOR INSERT TO authenticated
  WITH CHECK (organization_id IN (SELECT public.get_user_org_ids(auth.uid())));
CREATE POLICY "Org members can update leads" ON public.leads FOR UPDATE TO authenticated
  USING (organization_id IN (SELECT public.get_user_org_ids(auth.uid())));
CREATE POLICY "Public checkout can insert leads" ON public.leads FOR INSERT TO anon
  WITH CHECK (organization_id IN (SELECT id FROM public.organizations));
CREATE INDEX idx_leads_organization_id ON public.leads(organization_id);
CREATE INDEX idx_leads_product_id ON public.leads(product_id);
CREATE INDEX idx_leads_email ON public.leads(email);
CREATE INDEX idx_leads_created_at ON public.leads(created_at DESC);

-- 17. Payment gateways
CREATE TABLE public.payment_gateways (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  display_name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT false,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  environment TEXT NOT NULL DEFAULT 'sandbox',
  credentials JSONB NOT NULL DEFAULT '{}',
  priority INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.payment_gateways ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members can view gateways" ON public.payment_gateways FOR SELECT TO authenticated
  USING (organization_id IN (SELECT public.get_user_org_ids(auth.uid())));
CREATE POLICY "Org members can insert gateways" ON public.payment_gateways FOR INSERT TO authenticated
  WITH CHECK (organization_id IN (SELECT public.get_user_org_ids(auth.uid())));
CREATE POLICY "Org members can update gateways" ON public.payment_gateways FOR UPDATE TO authenticated
  USING (organization_id IN (SELECT public.get_user_org_ids(auth.uid())));
CREATE POLICY "Org members can delete gateways" ON public.payment_gateways FOR DELETE TO authenticated
  USING (organization_id IN (SELECT public.get_user_org_ids(auth.uid())));

-- 18. Auto-create profile + org on signup
CREATE OR REPLACE FUNCTION public.create_org_on_signup()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  new_org_id UUID;
  has_invite BOOLEAN;
  user_name TEXT;
BEGIN
  SELECT EXISTS(SELECT 1 FROM public.org_members WHERE user_id = NEW.id) INTO has_invite;
  IF NOT has_invite THEN
    user_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));
    INSERT INTO public.organizations (name, slug)
    VALUES (user_name || '''s Org', 'org-' || substr(gen_random_uuid()::text, 1, 8))
    RETURNING id INTO new_org_id;
    INSERT INTO public.org_members (user_id, organization_id, role) VALUES (NEW.id, new_org_id, 'owner');
  END IF;
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''))
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_create_org ON auth.users;
CREATE TRIGGER on_auth_user_created_create_org
  AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.create_org_on_signup();
