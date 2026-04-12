
-- Add access_type and config fields to products
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS access_type text DEFAULT 'link',
  ADD COLUMN IF NOT EXISTS sales_page_url text,
  ADD COLUMN IF NOT EXISTS support_email text,
  ADD COLUMN IF NOT EXISTS producer_name text,
  ADD COLUMN IF NOT EXISTS guarantee_days integer DEFAULT 7,
  ADD COLUMN IF NOT EXISTS fb_pixel_id text,
  ADD COLUMN IF NOT EXISTS ga_tracking_id text,
  ADD COLUMN IF NOT EXISTS google_ads_id text,
  ADD COLUMN IF NOT EXISTS meta_ads_id text,
  ADD COLUMN IF NOT EXISTS require_address boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS show_coupon_field boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS require_email_confirm boolean DEFAULT false;
