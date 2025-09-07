-- Create payment_sessions table for storing temporary payment data
CREATE TABLE IF NOT EXISTS payment_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT UNIQUE NOT NULL,
    customer_data JSONB NOT NULL,
    items JSONB NOT NULL,
    total_amount NUMERIC NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_payment_sessions_order_id ON payment_sessions(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_sessions_status ON payment_sessions(status);

-- Enable RLS
ALTER TABLE payment_sessions ENABLE ROW LEVEL SECURITY;

-- Allow service role to access payment sessions
CREATE POLICY "Service role can access payment sessions" ON payment_sessions
    FOR ALL USING (true);