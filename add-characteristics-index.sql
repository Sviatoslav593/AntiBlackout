-- ==========================================
-- ADD GIN INDEX FOR CHARACTERISTICS COLUMN
-- ==========================================

-- Add GIN index for better performance when filtering by characteristics
CREATE INDEX IF NOT EXISTS idx_products_characteristics 
ON products USING GIN (characteristics);

-- Add index for category_id to improve filtering performance
CREATE INDEX IF NOT EXISTS idx_products_category_id 
ON products (category_id);

-- Add composite index for category + characteristics filtering
CREATE INDEX IF NOT EXISTS idx_products_category_characteristics 
ON products (category_id, characteristics) 
WHERE characteristics IS NOT NULL;
