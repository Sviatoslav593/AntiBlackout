-- ==========================================
-- ROUND PRICES TO WHOLE NUMBERS
-- ==========================================
-- Execute this SQL in your Supabase SQL Editor
-- This script rounds all product prices to the nearest whole number

-- Show current price distribution before update
SELECT 
    'BEFORE UPDATE' as status,
    COUNT(*) as total_products,
    MIN(price) as min_price,
    MAX(price) as max_price,
    AVG(price) as avg_price,
    COUNT(CASE WHEN price != FLOOR(price) THEN 1 END) as products_with_cents
FROM products;

-- Update all prices to round to nearest whole number
UPDATE products 
SET price = ROUND(price),
    updated_at = NOW()
WHERE price != ROUND(price);

-- Show results after update
SELECT 
    'AFTER UPDATE' as status,
    COUNT(*) as total_products,
    MIN(price) as min_price,
    MAX(price) as max_price,
    AVG(price) as avg_price,
    COUNT(CASE WHEN price != FLOOR(price) THEN 1 END) as products_with_cents
FROM products;

-- Show some examples of updated prices
SELECT 
    external_id,
    name,
    price as updated_price
FROM products 
ORDER BY price DESC 
LIMIT 10;

-- Verify no products have cents anymore
SELECT 
    CASE 
        WHEN COUNT(CASE WHEN price != FLOOR(price) THEN 1 END) = 0 
        THEN 'SUCCESS: All prices are now whole numbers'
        ELSE 'WARNING: Some prices still have cents'
    END as verification_result
FROM products;
