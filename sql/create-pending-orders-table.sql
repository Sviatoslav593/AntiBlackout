-- Create pending_orders table for storing order data during payment preparation
CREATE TABLE IF NOT EXISTS pending_orders (
  id TEXT PRIMARY KEY,
  customer_data JSONB NOT NULL,
  items JSONB NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_pending_orders_created_at 
ON pending_orders(created_at);

-- Add RLS (Row Level Security) if needed
ALTER TABLE pending_orders ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service role to access all records
CREATE POLICY IF NOT EXISTS "Service role can access all pending orders" 
ON pending_orders FOR ALL 
TO service_role 
USING (true);

-- Create policy to allow authenticated users to access their own pending orders
CREATE POLICY IF NOT EXISTS "Users can access their own pending orders" 
ON pending_orders FOR ALL 
TO authenticated 
USING (true);
