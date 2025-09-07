-- Додати колонку order_number до таблиці orders
-- Виконайте цей SQL запит в Supabase Dashboard → SQL Editor

-- 1. Додати колонку order_number
ALTER TABLE orders 
ADD COLUMN order_number VARCHAR(50) UNIQUE;

-- 2. Створити індекс для швидкого пошуку
CREATE INDEX idx_orders_order_number ON orders(order_number);

-- 3. Оновити існуючі записи (якщо є)
-- Генеруємо номери замовлень для існуючих записів
UPDATE orders 
SET order_number = 'ORD-' || LPAD(EXTRACT(EPOCH FROM created_at)::text, 10, '0') || '-' || LPAD(id::text, 4, '0')
WHERE order_number IS NULL;

-- 4. Перевірити результат
SELECT id, order_number, customer_name, created_at 
FROM orders 
ORDER BY created_at DESC 
LIMIT 5;
