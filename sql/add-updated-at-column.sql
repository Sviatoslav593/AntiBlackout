-- Add updated_at column to orders table
-- This column will be updated whenever the order status changes

-- Add updated_at column to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Create index for better performance on updated_at queries
CREATE INDEX IF NOT EXISTS idx_orders_updated_at ON orders(updated_at);

-- Update the table comment
COMMENT ON COLUMN orders.updated_at IS 'Timestamp when the order was last updated';

-- Update existing records to have updated_at = created_at
UPDATE orders 
SET updated_at = created_at 
WHERE updated_at IS NULL;
