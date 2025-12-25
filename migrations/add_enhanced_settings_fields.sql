-- Add enhanced settings fields to jewellery_store_settings table
ALTER TABLE public.jewellery_store_settings
ADD COLUMN IF NOT EXISTS currency_symbol text DEFAULT '₹',
ADD COLUMN IF NOT EXISTS date_format text DEFAULT 'DD/MM/YYYY',
ADD COLUMN IF NOT EXISTS timezone text DEFAULT 'Asia/Kolkata',
ADD COLUMN IF NOT EXISTS theme text DEFAULT 'light',
ADD COLUMN IF NOT EXISTS logo_url text,
ADD COLUMN IF NOT EXISTS stock_alert_threshold integer DEFAULT 5;

-- Add check constraints
ALTER TABLE public.jewellery_store_settings
DROP CONSTRAINT IF EXISTS check_theme;
ALTER TABLE public.jewellery_store_settings
ADD CONSTRAINT check_theme CHECK (theme IN ('light', 'dark', 'system'));

ALTER TABLE public.jewellery_store_settings
DROP CONSTRAINT IF EXISTS check_date_format;
ALTER TABLE public.jewellery_store_settings
ADD CONSTRAINT check_date_format CHECK (date_format IN ('DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD', 'DD-MM-YYYY'));

ALTER TABLE public.jewellery_store_settings
DROP CONSTRAINT IF EXISTS check_stock_alert_threshold;
ALTER TABLE public.jewellery_store_settings
ADD CONSTRAINT check_stock_alert_threshold CHECK (stock_alert_threshold IS NULL OR stock_alert_threshold >= 0);

-- Add comment to the column
COMMENT ON COLUMN public.jewellery_store_settings.stock_alert_threshold IS 'Items with quantity at or below this value will be marked as low stock';

