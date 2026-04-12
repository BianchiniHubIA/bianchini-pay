
-- Restrict event_type to valid values
ALTER TABLE public.checkout_events
ADD CONSTRAINT checkout_events_valid_type
CHECK (event_type IN ('page_view', 'cta_click', 'purchase'));

-- Restrict the INSERT policy to only allow valid checkout_page_ids (published pages)
DROP POLICY "Anyone can insert checkout events" ON public.checkout_events;

CREATE POLICY "Anyone can insert events for published pages"
ON public.checkout_events
FOR INSERT
TO anon, authenticated
WITH CHECK (
  checkout_page_id IN (
    SELECT id FROM public.checkout_pages WHERE is_published = true
  )
);
