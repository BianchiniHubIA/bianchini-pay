-- Allow anonymous users to read offers linked to published checkout pages
CREATE POLICY "Anon can view offers for published checkouts"
ON public.offers
FOR SELECT
TO anon
USING (
  EXISTS (
    SELECT 1 FROM public.checkout_pages cp
    WHERE cp.offer_id = offers.id
    AND cp.is_published = true
  )
);

-- Allow anonymous users to insert leads
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'leads' AND policyname = 'Anon can insert leads') THEN
    CREATE POLICY "Anon can insert leads"
    ON public.leads
    FOR INSERT
    TO anon
    WITH CHECK (true);
  END IF;
END
$$;

-- Allow anonymous users to insert checkout events
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'checkout_events' AND policyname = 'Anon can insert checkout events') THEN
    CREATE POLICY "Anon can insert checkout events"
    ON public.checkout_events
    FOR INSERT
    TO anon
    WITH CHECK (true);
  END IF;
END
$$;