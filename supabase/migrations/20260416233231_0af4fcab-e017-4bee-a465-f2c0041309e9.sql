-- Index para acelerar lookup por external_id (id do pagamento no MP)
CREATE INDEX IF NOT EXISTS idx_orders_external_id ON public.orders(external_id);

-- Permitir atualização de orders pelos membros da org (necessário pra sync manual)
CREATE POLICY "Members can update orders"
ON public.orders FOR UPDATE
USING (organization_id IN (SELECT public.get_user_org_ids(auth.uid())));