-- Create payment_sessions table for LiqPay integration
CREATE TABLE IF NOT EXISTS payment_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id TEXT UNIQUE NOT NULL,
  customer_data JSONB NOT NULL,
  items JSONB NOT NULL,
  total_amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payment_sessions_order_id ON payment_sessions(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_sessions_status ON payment_sessions(status);

-- Enable Row Level Security
ALTER TABLE payment_sessions ENABLE ROW LEVEL SECURITY;

-- Create policy for service role access
CREATE POLICY IF NOT EXISTS "Service role can manage payment_sessions" ON payment_sessions
  FOR ALL USING (auth.role() = 'service_role');

-- Create policy for authenticated users to read their own sessions
CREATE POLICY IF NOT EXISTS "Users can read their own payment sessions" ON payment_sessions
  FOR SELECT USING (auth.role() = 'authenticated');

-- Add comment
COMMENT ON TABLE payment_sessions IS 'Stores temporary payment session data for LiqPay integration';
COMMENT ON COLUMN payment_sessions.order_id IS 'Unique order identifier used in LiqPay';
COMMENT ON COLUMN payment_sessions.customer_data IS 'Customer information for the order';
COMMENT ON COLUMN payment_sessions.items IS 'Order items data';
COMMENT ON COLUMN payment_sessions.total_amount IS 'Total order amount in kopecks';
COMMENT ON COLUMN payment_sessions.status IS 'Payment session status: pending, completed, failed';
