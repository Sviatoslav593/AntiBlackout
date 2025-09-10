-- ==========================================
-- FIX ORDERS TABLE - ADD order_number COLUMN
-- ==========================================
-- Execute this SQL in your Supabase SQL Editor

-- Add order_number column to existing orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS order_number TEXT UNIQUE;

-- Update existing orders with order numbers if they don't have them
UPDATE orders 
SET order_number = 'ORD-' || EXTRACT(EPOCH FROM created_at)::TEXT || '-' || SUBSTRING(id::TEXT, 1, 8)
WHERE order_number IS NULL;

-- Make order_number NOT NULL after updating existing records
ALTER TABLE orders 
ALTER COLUMN order_number SET NOT NULL;

-- Add default value for future orders
ALTER TABLE orders 
ALTER COLUMN order_number SET DEFAULT 'ORD-' || EXTRACT(EPOCH FROM NOW())::TEXT;
