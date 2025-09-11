-- ==========================================
-- CHECK CURRENT PRICE DISTRIBUTION
-- ==========================================
-- Execute this SQL in your Supabase SQL Editor
-- This script shows current price distribution to help decide which approach to use

-- Show overall price statistics
SELECT 
    COUNT(*) as total_products,
    MIN(price) as min_price,
    MAX(price) as max_price,
    AVG(price) as avg_price,
    COUNT(CASE WHEN price != FLOOR(price) THEN 1 END) as products_with_cents,
    ROUND(COUNT(CASE WHEN price != FLOOR(price) THEN 1 END) * 100.0 / COUNT(*), 2) as percent_with_cents
FROM products;

-- Show price distribution by ranges
SELECT 
    CASE 
        WHEN price < 100 THEN 'Under 100₴'
        WHEN price < 500 THEN '100-499₴'
        WHEN price < 1000 THEN '500-999₴'
        WHEN price < 2000 THEN '1000-1999₴'
        WHEN price < 5000 THEN '2000-4999₴'
        ELSE '5000₴+'
    END as price_range,
    COUNT(*) as product_count,
    COUNT(CASE WHEN price != FLOOR(price) THEN 1 END) as with_cents,
    ROUND(AVG(price), 2) as avg_price_in_range
FROM products
GROUP BY 
    CASE 
        WHEN price < 100 THEN 'Under 100₴'
        WHEN price < 500 THEN '100-499₴'
        WHEN price < 1000 THEN '500-999₴'
        WHEN price < 2000 THEN '1000-1999₴'
        WHEN price < 5000 THEN '2000-4999₴'
        ELSE '5000₴+'
    END
ORDER BY MIN(price);

-- Show examples of products with cents
SELECT 
    external_id,
    name,
    price,
    FLOOR(price) as floor_price,
    ROUND(price) as rounded_price,
    price - FLOOR(price) as cents_amount
FROM products 
WHERE price != FLOOR(price)
ORDER BY price DESC 
LIMIT 20;

-- Show impact of different rounding approaches
SELECT 
    'Current' as approach,
    SUM(price) as total_value,
    AVG(price) as avg_price
FROM products
UNION ALL
SELECT 
    'Floor (remove cents)' as approach,
    SUM(FLOOR(price)) as total_value,
    AVG(FLOOR(price)) as avg_price
FROM products
UNION ALL
SELECT 
    'Round (nearest whole)' as approach,
    SUM(ROUND(price)) as total_value,
    AVG(ROUND(price)) as avg_price
FROM products;
