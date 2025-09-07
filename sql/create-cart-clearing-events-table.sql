-- Create cart_clearing_events table for tracking cart clearing events
CREATE TABLE cart_clearing_events (
  id SERIAL PRIMARY KEY,
  order_id TEXT NOT NULL,
  cleared_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_cart_clearing_events_order_id ON cart_clearing_events(order_id);

-- Add comment
COMMENT ON TABLE cart_clearing_events IS 'Tracks when carts should be cleared after successful payments';
