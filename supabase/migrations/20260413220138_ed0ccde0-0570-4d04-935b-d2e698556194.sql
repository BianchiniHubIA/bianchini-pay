ALTER TABLE public.checkout_pages 
ADD COLUMN IF NOT EXISTS blocks_layout jsonb DEFAULT '{}' ::jsonb;