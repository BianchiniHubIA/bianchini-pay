
CREATE OR REPLACE FUNCTION public.get_public_product_settings(_offer_id uuid)
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
  JOIN public.offers o ON o.product_id = p.id
  JOIN public.checkout_pages cp ON cp.offer_id = o.id
  WHERE o.id = _offer_id AND cp.is_published = true
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_product_settings(uuid) TO anon, authenticated;
