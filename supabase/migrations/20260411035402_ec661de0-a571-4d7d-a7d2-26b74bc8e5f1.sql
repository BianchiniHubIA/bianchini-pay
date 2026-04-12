
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

CREATE POLICY "Members can view order bumps"
ON public.order_bumps
FOR SELECT
USING (checkout_page_id IN (
  SELECT cp.id FROM checkout_pages cp
  WHERE cp.organization_id IN (SELECT get_user_org_ids(auth.uid()))
));

CREATE POLICY "Editors+ can create order bumps"
ON public.order_bumps
FOR INSERT
WITH CHECK (checkout_page_id IN (
  SELECT cp.id FROM checkout_pages cp
  WHERE has_org_role(auth.uid(), cp.organization_id, ARRAY['owner'::app_role, 'admin'::app_role, 'editor'::app_role])
));

CREATE POLICY "Editors+ can update order bumps"
ON public.order_bumps
FOR UPDATE
USING (checkout_page_id IN (
  SELECT cp.id FROM checkout_pages cp
  WHERE has_org_role(auth.uid(), cp.organization_id, ARRAY['owner'::app_role, 'admin'::app_role, 'editor'::app_role])
));

CREATE POLICY "Admins+ can delete order bumps"
ON public.order_bumps
FOR DELETE
USING (checkout_page_id IN (
  SELECT cp.id FROM checkout_pages cp
  WHERE has_org_role(auth.uid(), cp.organization_id, ARRAY['owner'::app_role, 'admin'::app_role])
));

CREATE POLICY "Public can view active bumps on published pages"
ON public.order_bumps
FOR SELECT
TO anon
USING (is_active = true AND checkout_page_id IN (
  SELECT cp.id FROM checkout_pages cp WHERE cp.is_published = true
));
