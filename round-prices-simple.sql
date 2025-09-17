-- ==========================================
-- ШВИДКЕ ОКРУГЛЕННЯ ЦІН ТОВАРІВ
-- ==========================================
-- Простий SQL скрипт для округлення цін до цілих чисел
-- Виконайте в Supabase Dashboard → SQL Editor

-- Показуємо скільки товарів мають копійки
SELECT 
    COUNT(*) as всього_товарів,
    COUNT(CASE WHEN price != FLOOR(price) THEN 1 END) as з_копійками
FROM products 
WHERE price IS NOT NULL;

-- Округлюємо всі ціни
UPDATE products 
SET 
    price = ROUND(price),
    updated_at = NOW()
WHERE price IS NOT NULL 
  AND price != ROUND(price);

-- Перевіряємо результат
SELECT 
    CASE 
        WHEN COUNT(CASE WHEN price != FLOOR(price) THEN 1 END) = 0 
        THEN '✅ Всі ціни округлені!'
        ELSE '❌ Залишилися копійки'
    END as результат
FROM products
WHERE price IS NOT NULL;
