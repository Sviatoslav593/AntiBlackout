-- Update order_items table to include product_name for order history
-- This ensures that product changes don't affect past orders

-- Add product_name column to order_items table
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS product_name text;

-- Update existing records to have product_name (if any exist)
-- This will be handled by the application when creating new orders

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_order_items_product_name ON order_items(product_name);

-- Update the table comment
COMMENT ON TABLE order_items IS 'Order items with product details at time of purchase';
COMMENT ON COLUMN order_items.product_name IS 'Product name at time of purchase (snapshot)';
COMMENT ON COLUMN order_items.price IS 'Total price for this item (price * quantity) at time of purchase';
