
DROP FUNCTION IF EXISTS public.get_public_product_settings(uuid);

CREATE OR REPLACE FUNCTION public.get_public_product_settings(_product_id uuid)
RETURNS TABLE (
  require_address boolean,
  show_coupon_field boolean,
  require_email_confirm boolean,
  payment_methods jsonb
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.require_address, p.show_coupon_field, p.require_email_confirm, to_jsonb(p.payment_methods)
  FROM public.products p
  WHERE p.id = _product_id
    AND EXISTS (
      SELECT 1 FROM public.offers o
      JOIN public.checkout_pages cp ON cp.offer_id = o.id
      WHERE o.product_id = p.id AND cp.is_published = true
    )
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_product_settings(uuid) TO anon, authenticated;
