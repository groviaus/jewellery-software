-- Add enhanced settings fields to jewellery_store_settings table
ALTER TABLE public.jewellery_store_settings
ADD COLUMN IF NOT EXISTS currency_symbol text DEFAULT '₹',
ADD COLUMN IF NOT EXISTS date_format text DEFAULT 'DD/MM/YYYY',
ADD COLUMN IF NOT EXISTS timezone text DEFAULT 'Asia/Kolkata',
ADD COLUMN IF NOT EXISTS theme text DEFAULT 'light',
ADD COLUMN IF NOT EXISTS logo_url text;

-- Add check constraints
ALTER TABLE public.jewellery_store_settings
ADD CONSTRAINT check_theme CHECK (theme IN ('light', 'dark', 'system')),
ADD CONSTRAINT check_date_format CHECK (date_format IN ('DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD', 'DD-MM-YYYY'));

