
-- Checkout pages table
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

-- Enable RLS
ALTER TABLE public.checkout_pages ENABLE ROW LEVEL SECURITY;

-- Members can view their org pages
CREATE POLICY "Members can view checkout pages"
ON public.checkout_pages
FOR SELECT
USING (organization_id IN (SELECT get_user_org_ids(auth.uid())));

-- Editors+ can create
CREATE POLICY "Editors+ can create checkout pages"
ON public.checkout_pages
FOR INSERT
WITH CHECK (has_org_role(auth.uid(), organization_id, ARRAY['owner'::app_role, 'admin'::app_role, 'editor'::app_role]));

-- Editors+ can update
CREATE POLICY "Editors+ can update checkout pages"
ON public.checkout_pages
FOR UPDATE
USING (has_org_role(auth.uid(), organization_id, ARRAY['owner'::app_role, 'admin'::app_role, 'editor'::app_role]));

-- Admins+ can delete
CREATE POLICY "Admins+ can delete checkout pages"
ON public.checkout_pages
FOR DELETE
USING (has_org_role(auth.uid(), organization_id, ARRAY['owner'::app_role, 'admin'::app_role]));

-- Public can view published pages (for checkout rendering)
CREATE POLICY "Public can view published checkout pages"
ON public.checkout_pages
FOR SELECT
TO anon
USING (is_published = true);

-- Timestamp trigger
CREATE TRIGGER update_checkout_pages_updated_at
BEFORE UPDATE ON public.checkout_pages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Index for slug lookup
CREATE INDEX idx_checkout_pages_slug ON public.checkout_pages(slug);
CREATE INDEX idx_checkout_pages_offer_id ON public.checkout_pages(offer_id);
