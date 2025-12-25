-- ============================================
-- Jewellery Store Database Schema
-- Run this in your new jewellery-store project's SQL Editor
-- ============================================

-- Step 1: Create Tables
-- ============================================

-- Store Settings Table
CREATE TABLE IF NOT EXISTS public.jewellery_store_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  store_name text NOT NULL,
  gst_number text,
  address text,
  gst_rate numeric DEFAULT 3.0 CHECK (gst_rate >= 0 AND gst_rate <= 100),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Items Table
CREATE TABLE IF NOT EXISTS public.jewellery_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  metal_type text NOT NULL CHECK (metal_type IN ('Gold', 'Silver', 'Diamond')),
  purity text NOT NULL,
  gross_weight numeric NOT NULL CHECK (gross_weight >= 0),
  net_weight numeric NOT NULL CHECK (net_weight >= 0),
  making_charge numeric NOT NULL CHECK (making_charge >= 0),
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity >= 0),
  sku text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Customers Table
CREATE TABLE IF NOT EXISTS public.jewellery_customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Invoices Table
CREATE TABLE IF NOT EXISTS public.jewellery_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES public.jewellery_customers(id) ON DELETE SET NULL,
  invoice_number text NOT NULL UNIQUE,
  total_amount numeric NOT NULL CHECK (total_amount >= 0),
  gst_amount numeric NOT NULL CHECK (gst_amount >= 0),
  gold_value numeric NOT NULL CHECK (gold_value >= 0),
  making_charges numeric NOT NULL CHECK (making_charges >= 0),
  created_at timestamptz DEFAULT now()
);

-- Invoice Items Table
CREATE TABLE IF NOT EXISTS public.jewellery_invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES public.jewellery_invoices(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES public.jewellery_items(id) ON DELETE RESTRICT,
  quantity integer NOT NULL CHECK (quantity > 0),
  weight numeric NOT NULL CHECK (weight >= 0),
  price numeric NOT NULL CHECK (price >= 0),
  created_at timestamptz DEFAULT now()
);

-- Step 2: Create Indexes
-- ============================================

CREATE INDEX IF NOT EXISTS idx_jewellery_items_user_id ON public.jewellery_items(user_id);
CREATE INDEX IF NOT EXISTS idx_jewellery_items_sku ON public.jewellery_items(sku);
CREATE INDEX IF NOT EXISTS idx_jewellery_customers_user_id ON public.jewellery_customers(user_id);
CREATE INDEX IF NOT EXISTS idx_jewellery_invoices_user_id ON public.jewellery_invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_jewellery_invoices_customer_id ON public.jewellery_invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_jewellery_invoices_invoice_number ON public.jewellery_invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_jewellery_invoice_items_invoice_id ON public.jewellery_invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_jewellery_invoice_items_item_id ON public.jewellery_invoice_items(item_id);

-- Step 3: Enable Row Level Security
-- ============================================

ALTER TABLE public.jewellery_store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jewellery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jewellery_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jewellery_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jewellery_invoice_items ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS Policies
-- ============================================

-- Store Settings Policies
CREATE POLICY "Users can view own store settings" ON public.jewellery_store_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own store settings" ON public.jewellery_store_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own store settings" ON public.jewellery_store_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own store settings" ON public.jewellery_store_settings
  FOR DELETE USING (auth.uid() = user_id);

-- Items Policies
CREATE POLICY "Users can view own items" ON public.jewellery_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own items" ON public.jewellery_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own items" ON public.jewellery_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own items" ON public.jewellery_items
  FOR DELETE USING (auth.uid() = user_id);

-- Customers Policies
CREATE POLICY "Users can view own customers" ON public.jewellery_customers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own customers" ON public.jewellery_customers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own customers" ON public.jewellery_customers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own customers" ON public.jewellery_customers
  FOR DELETE USING (auth.uid() = user_id);

-- Invoices Policies
CREATE POLICY "Users can view own invoices" ON public.jewellery_invoices
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own invoices" ON public.jewellery_invoices
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own invoices" ON public.jewellery_invoices
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own invoices" ON public.jewellery_invoices
  FOR DELETE USING (auth.uid() = user_id);

-- Invoice Items Policies
CREATE POLICY "Users can view own invoice items" ON public.jewellery_invoice_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.jewellery_invoices
      WHERE jewellery_invoices.id = jewellery_invoice_items.invoice_id
      AND jewellery_invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own invoice items" ON public.jewellery_invoice_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.jewellery_invoices
      WHERE jewellery_invoices.id = jewellery_invoice_items.invoice_id
      AND jewellery_invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own invoice items" ON public.jewellery_invoice_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.jewellery_invoices
      WHERE jewellery_invoices.id = jewellery_invoice_items.invoice_id
      AND jewellery_invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own invoice items" ON public.jewellery_invoice_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.jewellery_invoices
      WHERE jewellery_invoices.id = jewellery_invoice_items.invoice_id
      AND jewellery_invoices.user_id = auth.uid()
    )
  );

-- Step 5: Create Function and Triggers for updated_at
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_jewellery_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Triggers
CREATE TRIGGER update_jewellery_store_settings_updated_at
  BEFORE UPDATE ON public.jewellery_store_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_jewellery_updated_at_column();

CREATE TRIGGER update_jewellery_items_updated_at
  BEFORE UPDATE ON public.jewellery_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_jewellery_updated_at_column();

CREATE TRIGGER update_jewellery_customers_updated_at
  BEFORE UPDATE ON public.jewellery_customers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_jewellery_updated_at_column();

-- ============================================
-- Done! All tables, policies, and triggers created.
-- ============================================

