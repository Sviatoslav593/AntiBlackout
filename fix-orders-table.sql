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

-- ==========================================
-- FIX ORDER_ITEMS TABLE - ADD product_name COLUMN
-- ==========================================

-- Add product_name column to existing order_items table
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS product_name TEXT;

-- Update existing order_items with product names
UPDATE order_items 
SET product_name = p.name
FROM products p
WHERE order_items.product_id = p.id
AND order_items.product_name IS NULL;

-- Make product_name NOT NULL after updating existing records
ALTER TABLE order_items 
ALTER COLUMN product_name SET NOT NULL;
