-- Оновлення схеми таблиці products для підтримки XML імпорту
-- Виконайте цей SQL запит в Supabase Dashboard → SQL Editor

-- 1. Додати нові колонки до таблиці products
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS external_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS price NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS brand TEXT,
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 2. Створити індекси для швидкого пошуку
CREATE INDEX IF NOT EXISTS idx_products_external_id ON products(external_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);

-- 3. Видалити всі фейкові товари (якщо є)
-- ВАЖЛИВО: Перевірте, які товари є фейковими перед виконанням
DELETE FROM products 
WHERE external_id IS NULL 
  AND (name LIKE '%Test%' OR name LIKE '%Dummy%' OR name LIKE '%Placeholder%' OR name LIKE '%Example%');

-- 4. Оновити існуючі товари (якщо потрібно)
-- Встановити значення за замовчуванням для існуючих товарів
UPDATE products 
SET 
  price = COALESCE(price, 0),
  quantity = COALESCE(quantity, 0),
  category = COALESCE(category, 'Uncategorized'),
  brand = COALESCE(brand, 'Unknown')
WHERE external_id IS NULL;

-- 5. Перевірити структуру таблиці
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;

-- 6. Перевірити кількість товарів
SELECT 
  COUNT(*) as total_products,
  COUNT(external_id) as products_with_external_id,
  COUNT(*) - COUNT(external_id) as products_without_external_id
FROM products;
