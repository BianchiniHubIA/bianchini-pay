CREATE TABLE public.product_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.org_members(id) ON DELETE CASCADE,
  percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(product_id, member_id)
);

ALTER TABLE public.product_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view product_members"
  ON public.product_members FOR SELECT
  USING (
    product_id IN (
      SELECT p.id FROM public.products p
      WHERE p.organization_id IN (SELECT get_user_org_ids(auth.uid()))
    )
  );

CREATE POLICY "Admins can insert product_members"
  ON public.product_members FOR INSERT
  WITH CHECK (
    product_id IN (
      SELECT p.id FROM public.products p
      WHERE has_org_role(auth.uid(), p.organization_id, ARRAY['owner'::app_role, 'admin'::app_role])
    )
  );

CREATE POLICY "Admins can update product_members"
  ON public.product_members FOR UPDATE
  USING (
    product_id IN (
      SELECT p.id FROM public.products p
      WHERE has_org_role(auth.uid(), p.organization_id, ARRAY['owner'::app_role, 'admin'::app_role])
    )
  );

CREATE POLICY "Admins can delete product_members"
  ON public.product_members FOR DELETE
  USING (
    product_id IN (
      SELECT p.id FROM public.products p
      WHERE has_org_role(auth.uid(), p.organization_id, ARRAY['owner'::app_role, 'admin'::app_role])
    )
  );