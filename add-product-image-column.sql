-- Add product_image column to order_items table
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS product_image TEXT;

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'order_items' 
AND column_name = 'product_image';
