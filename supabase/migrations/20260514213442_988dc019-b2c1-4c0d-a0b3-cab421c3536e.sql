ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS payment_methods text[] NOT NULL DEFAULT ARRAY['pix','credit_card','boleto']::text[];