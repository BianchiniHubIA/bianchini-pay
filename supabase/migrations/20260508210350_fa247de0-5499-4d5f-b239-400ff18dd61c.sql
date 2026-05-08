ALTER TABLE public.offers
  ADD COLUMN IF NOT EXISTS interest_free_installments integer,
  ADD COLUMN IF NOT EXISTS installment_interest_rate_monthly numeric(6,3) NOT NULL DEFAULT 2.99;

UPDATE public.offers SET interest_free_installments = installments WHERE interest_free_installments IS NULL;