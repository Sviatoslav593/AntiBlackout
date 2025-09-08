-- Додати колонку updated_at до таблиці products
ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT now();

-- Оновити всі існуючі записи
UPDATE products SET updated_at = NOW() WHERE updated_at IS NULL;

-- Додати індекс для швидкого пошуку
CREATE INDEX IF NOT EXISTS idx_products_updated_at ON products(updated_at);
