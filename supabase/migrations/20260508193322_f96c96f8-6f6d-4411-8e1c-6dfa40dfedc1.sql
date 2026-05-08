ALTER TABLE public.offers
  ADD COLUMN IF NOT EXISTS workspace_plan_id text,
  ADD COLUMN IF NOT EXISTS workspace_plan_name text;