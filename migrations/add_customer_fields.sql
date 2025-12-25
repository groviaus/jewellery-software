-- Migration: Add email, address, tags, and notes fields to customers table
-- Run this migration in your Supabase SQL editor

ALTER TABLE jewellery_customers
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_customers_email ON jewellery_customers(email);

-- Add GIN index on tags array for faster array searches
CREATE INDEX IF NOT EXISTS idx_customers_tags ON jewellery_customers USING GIN(tags);

