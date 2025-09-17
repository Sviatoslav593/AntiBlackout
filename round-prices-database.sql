-- ==========================================
-- ОКРУГЛЕННЯ ЦІН ТОВАРІВ ДО ЦІЛИХ ЧИСЕЛ
-- ==========================================
-- Виконайте цей SQL скрипт в Supabase Dashboard → SQL Editor
-- Скрипт округлює всі ціни товарів до найближчого цілого числа

-- 1. Показуємо статистику ДО округлення
SELECT 
    'ДО ОКРУГЛЕННЯ' as статус,
    COUNT(*) as загальна_кількість_товарів,
    MIN(price) as мінімальна_ціна,
    MAX(price) as максимальна_ціна,
    ROUND(AVG(price), 2) as середня_ціна,
    COUNT(CASE WHEN price != FLOOR(price) THEN 1 END) as товарів_з_копійками,
    ROUND(COUNT(CASE WHEN price != FLOOR(price) THEN 1 END) * 100.0 / COUNT(*), 2) as відсоток_з_копійками
FROM products
WHERE price IS NOT NULL;

-- 2. Показуємо приклади товарів з копійками
SELECT 
    'ПРИКЛАДИ ТОВАРІВ З КОПІЙКАМИ' as інформація,
    external_id,
    name,
    price as поточна_ціна,
    ROUND(price) as округлена_ціна,
    ROUND(price) - price as різниця
FROM products 
WHERE price IS NOT NULL 
  AND price != FLOOR(price)
ORDER BY price DESC 
LIMIT 10;

-- 3. Округлюємо всі ціни до найближчого цілого числа
UPDATE products 
SET 
    price = ROUND(price),
    updated_at = NOW()
WHERE price IS NOT NULL 
  AND price != ROUND(price);

-- 4. Показуємо статистику ПІСЛЯ округлення
SELECT 
    'ПІСЛЯ ОКРУГЛЕННЯ' as статус,
    COUNT(*) as загальна_кількість_товарів,
    MIN(price) as мінімальна_ціна,
    MAX(price) as максимальна_ціна,
    ROUND(AVG(price), 2) as середня_ціна,
    COUNT(CASE WHEN price != FLOOR(price) THEN 1 END) as товарів_з_копійками,
    ROUND(COUNT(CASE WHEN price != FLOOR(price) THEN 1 END) * 100.0 / COUNT(*), 2) as відсоток_з_копійками
FROM products
WHERE price IS NOT NULL;

-- 5. Показуємо приклади оновлених цін
SELECT 
    'ПРИКЛАДИ ОНОВЛЕНИХ ЦІН' as інформація,
    external_id,
    name,
    price as оновлена_ціна
FROM products 
WHERE price IS NOT NULL
ORDER BY price DESC 
LIMIT 10;

-- 6. Перевіряємо, чи всі ціни тепер цілі числа
SELECT 
    CASE 
        WHEN COUNT(CASE WHEN price != FLOOR(price) THEN 1 END) = 0 
        THEN '✅ УСПІХ: Всі ціни округлені до цілих чисел!'
        ELSE '⚠️ УВАГА: Залишилися товари з копійками'
    END as результат_перевірки,
    COUNT(CASE WHEN price != FLOOR(price) THEN 1 END) as залишкові_копійки
FROM products
WHERE price IS NOT NULL;

-- 7. Показуємо розподіл цін за діапазонами
SELECT 
    CASE 
        WHEN price < 100 THEN 'До 100₴'
        WHEN price < 500 THEN '100-499₴'
        WHEN price < 1000 THEN '500-999₴'
        WHEN price < 2000 THEN '1000-1999₴'
        WHEN price < 5000 THEN '2000-4999₴'
        ELSE '5000₴+'
    END as діапазон_цін,
    COUNT(*) as кількість_товарів,
    ROUND(AVG(price), 2) as середня_ціна_в_діапазоні
FROM products
WHERE price IS NOT NULL
GROUP BY 
    CASE 
        WHEN price < 100 THEN 'До 100₴'
        WHEN price < 500 THEN '100-499₴'
        WHEN price < 1000 THEN '500-999₴'
        WHEN price < 2000 THEN '1000-1999₴'
        WHEN price < 5000 THEN '2000-4999₴'
        ELSE '5000₴+'
    END
ORDER BY MIN(price);

-- 8. Показуємо загальну статистику оновлення
SELECT 
    'ЗАГАЛЬНА СТАТИСТИКА' as інформація,
    COUNT(*) as всього_товарів,
    COUNT(CASE WHEN price IS NOT NULL THEN 1 END) as товарів_з_цінами,
    COUNT(CASE WHEN price IS NULL THEN 1 END) as товарів_без_цін,
    ROUND(SUM(price), 2) as загальна_вартість_всіх_товарів,
    ROUND(AVG(price), 2) as середня_ціна_товару
FROM products;
