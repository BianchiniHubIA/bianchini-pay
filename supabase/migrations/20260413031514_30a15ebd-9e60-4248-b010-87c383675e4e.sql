-- Add unique constraint on customers for upsert by email within organization
ALTER TABLE public.customers ADD CONSTRAINT customers_org_email_unique UNIQUE (organization_id, email);