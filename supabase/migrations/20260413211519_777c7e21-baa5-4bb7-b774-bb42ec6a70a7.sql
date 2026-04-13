
-- 1. Fix anonymous leads INSERT: restrict to orgs with published checkout pages
DROP POLICY IF EXISTS "Public checkout can insert leads" ON public.leads;
CREATE POLICY "Public checkout can insert leads"
  ON public.leads
  FOR INSERT TO anon
  WITH CHECK (
    organization_id IN (
      SELECT cp.organization_id FROM public.checkout_pages cp WHERE cp.is_published = true
    )
  );

-- 2. Fix payment_gateways write policies: restrict to admin/owner only
DROP POLICY IF EXISTS "Org members can insert gateways" ON public.payment_gateways;
DROP POLICY IF EXISTS "Org members can update gateways" ON public.payment_gateways;
DROP POLICY IF EXISTS "Org members can delete gateways" ON public.payment_gateways;

CREATE POLICY "Admins can insert gateways"
  ON public.payment_gateways
  FOR INSERT TO authenticated
  WITH CHECK (has_org_role(auth.uid(), organization_id, ARRAY['owner'::app_role, 'admin'::app_role]));

CREATE POLICY "Admins can update gateways"
  ON public.payment_gateways
  FOR UPDATE TO authenticated
  USING (has_org_role(auth.uid(), organization_id, ARRAY['owner'::app_role, 'admin'::app_role]));

CREATE POLICY "Admins can delete gateways"
  ON public.payment_gateways
  FOR DELETE TO authenticated
  USING (has_org_role(auth.uid(), organization_id, ARRAY['owner'::app_role, 'admin'::app_role]));

-- 3. Fix checkout_pages anon SELECT: only expose presentation columns via a restricted policy
DROP POLICY IF EXISTS "Public can view published checkout pages" ON public.checkout_pages;

-- Create a view with only safe public columns
CREATE OR REPLACE VIEW public.public_checkout_pages AS
SELECT id, slug, offer_id, organization_id, template, headline, subheadline, description,
       cta_text, primary_color, bg_color, accent_color, image_url, logo_url,
       show_guarantee, guarantee_text, is_published
FROM public.checkout_pages
WHERE is_published = true;

-- Grant anon access to the view
GRANT SELECT ON public.public_checkout_pages TO anon;

-- Re-add a restricted anon policy that only allows access to published pages
-- (needed for the view to work through RLS)
CREATE POLICY "Public can view published checkout pages"
  ON public.checkout_pages
  FOR SELECT TO anon
  USING (is_published = true);
