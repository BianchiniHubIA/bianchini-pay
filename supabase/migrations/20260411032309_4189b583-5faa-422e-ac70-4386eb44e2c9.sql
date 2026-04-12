
-- Checkout events for analytics
CREATE TABLE public.checkout_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  checkout_page_id UUID NOT NULL REFERENCES public.checkout_pages(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  visitor_id TEXT,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.checkout_events ENABLE ROW LEVEL SECURITY;

-- Anyone can insert events (public tracking)
CREATE POLICY "Anyone can insert checkout events"
ON public.checkout_events
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Members can view events for their org's pages
CREATE POLICY "Members can view checkout events"
ON public.checkout_events
FOR SELECT
TO authenticated
USING (
  checkout_page_id IN (
    SELECT cp.id FROM public.checkout_pages cp
    WHERE cp.organization_id IN (SELECT get_user_org_ids(auth.uid()))
  )
);

-- Indexes for efficient querying
CREATE INDEX idx_checkout_events_page_id ON public.checkout_events(checkout_page_id);
CREATE INDEX idx_checkout_events_type ON public.checkout_events(event_type);
CREATE INDEX idx_checkout_events_created_at ON public.checkout_events(created_at);
CREATE INDEX idx_checkout_events_visitor ON public.checkout_events(visitor_id);
