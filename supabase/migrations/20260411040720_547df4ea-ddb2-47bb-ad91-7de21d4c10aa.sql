
DROP POLICY "Public checkout can insert leads" ON public.leads;

CREATE POLICY "Public checkout can insert leads"
  ON public.leads FOR INSERT TO anon
  WITH CHECK (
    organization_id IN (SELECT id FROM public.organizations)
  );
