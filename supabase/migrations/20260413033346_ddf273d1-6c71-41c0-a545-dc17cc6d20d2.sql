-- Allow anon users to validate active coupons on public checkout
CREATE POLICY "Anon can view active coupons"
ON public.coupons
FOR SELECT
TO anon
USING (
  is_active = true
  AND (expires_at IS NULL OR expires_at >= CURRENT_DATE)
  AND (starts_at IS NULL OR starts_at <= CURRENT_DATE)
  AND (max_uses IS NULL OR used_count < max_uses)
);