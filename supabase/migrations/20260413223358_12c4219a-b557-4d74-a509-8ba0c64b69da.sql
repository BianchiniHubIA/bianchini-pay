-- Allow anon to read public_key from payment_gateways for published checkouts
CREATE POLICY "Anon can view gateway public_key for published checkouts"
ON public.payment_gateways FOR SELECT TO anon
USING (
  EXISTS (
    SELECT 1 FROM public.checkout_pages cp
    WHERE cp.organization_id = payment_gateways.organization_id
    AND cp.is_published = true
  )
);
