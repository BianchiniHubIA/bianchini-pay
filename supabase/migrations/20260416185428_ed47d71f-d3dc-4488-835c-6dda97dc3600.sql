-- Add webhook config to products
ALTER TABLE public.products
  ADD COLUMN webhook_url text,
  ADD COLUMN webhook_secret text;

-- Webhook delivery logs
CREATE TABLE public.webhook_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  target_url text NOT NULL,
  payload jsonb NOT NULL,
  status_code integer,
  response_body text,
  error text,
  attempt integer NOT NULL DEFAULT 1,
  delivered_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_webhook_deliveries_org ON public.webhook_deliveries(organization_id, created_at DESC);
CREATE INDEX idx_webhook_deliveries_order ON public.webhook_deliveries(order_id);

ALTER TABLE public.webhook_deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view webhook deliveries"
  ON public.webhook_deliveries FOR SELECT
  USING (organization_id IN (SELECT public.get_user_org_ids(auth.uid())));
