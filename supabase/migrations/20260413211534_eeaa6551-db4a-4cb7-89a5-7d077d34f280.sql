
-- Fix the view to use SECURITY INVOKER
CREATE OR REPLACE VIEW public.public_checkout_pages
WITH (security_invoker = true) AS
SELECT id, slug, offer_id, organization_id, template, headline, subheadline, description,
       cta_text, primary_color, bg_color, accent_color, image_url, logo_url,
       show_guarantee, guarantee_text, is_published
FROM public.checkout_pages
WHERE is_published = true;
