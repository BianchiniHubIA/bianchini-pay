CREATE TABLE public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  code TEXT NOT NULL,
  discount_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
  starts_at DATE,
  expires_at DATE,
  max_uses INTEGER,
  used_count INTEGER NOT NULL DEFAULT 0,
  apply_to_bumps BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, code)
);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view coupons"
  ON public.coupons FOR SELECT
  USING (organization_id IN (SELECT get_user_org_ids(auth.uid())));

CREATE POLICY "Editors+ can create coupons"
  ON public.coupons FOR INSERT
  WITH CHECK (has_org_role(auth.uid(), organization_id, ARRAY['owner'::app_role, 'admin'::app_role, 'editor'::app_role]));

CREATE POLICY "Editors+ can update coupons"
  ON public.coupons FOR UPDATE
  USING (has_org_role(auth.uid(), organization_id, ARRAY['owner'::app_role, 'admin'::app_role, 'editor'::app_role]));

CREATE POLICY "Admins+ can delete coupons"
  ON public.coupons FOR DELETE
  USING (has_org_role(auth.uid(), organization_id, ARRAY['owner'::app_role, 'admin'::app_role]));