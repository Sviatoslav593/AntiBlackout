-- Перевірка та оновлення схеми таблиці orders для адмін-панелі
-- Виконайте цей SQL запит в Supabase Dashboard → SQL Editor

-- 1. Перевірити поточну структуру таблиці orders
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'orders' 
ORDER BY ordinal_position;

-- 2. Додати колонку order_number якщо її немає
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'order_number'
    ) THEN
        ALTER TABLE orders ADD COLUMN order_number VARCHAR(50) UNIQUE;
        CREATE INDEX idx_orders_order_number ON orders(order_number);
        
        -- Оновити існуючі записи
        UPDATE orders 
        SET order_number = 'ORD-' || LPAD(EXTRACT(EPOCH FROM created_at)::text, 10, '0') || '-' || LPAD(id::text, 4, '0')
        WHERE order_number IS NULL;
        
        RAISE NOTICE 'Column order_number added successfully';
    ELSE
        RAISE NOTICE 'Column order_number already exists';
    END IF;
END $$;

-- 3. Перевірити чи є всі необхідні колонки
DO $$
DECLARE
    missing_columns TEXT[] := ARRAY[]::TEXT[];
    col TEXT;
    required_columns TEXT[] := ARRAY[
        'id', 'order_number', 'customer_name', 'customer_email', 
        'customer_phone', 'city', 'branch', 'payment_method', 
        'status', 'total_amount', 'created_at', 'updated_at'
    ];
BEGIN
    FOREACH col IN ARRAY required_columns
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'orders' AND column_name = col
        ) THEN
            missing_columns := array_append(missing_columns, col);
        END IF;
    END LOOP;
    
    IF array_length(missing_columns, 1) > 0 THEN
        RAISE NOTICE 'Missing columns: %', array_to_string(missing_columns, ', ');
    ELSE
        RAISE NOTICE 'All required columns exist';
    END IF;
END $$;

-- 4. Додати колонку updated_at якщо її немає
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE orders ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        CREATE INDEX idx_orders_updated_at ON orders(updated_at);
        RAISE NOTICE 'Column updated_at added successfully';
    ELSE
        RAISE NOTICE 'Column updated_at already exists';
    END IF;
END $$;

-- 5. Створити тригер для автоматичного оновлення updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Додати тригер якщо його немає
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_orders_updated_at'
    ) THEN
        CREATE TRIGGER update_orders_updated_at
            BEFORE UPDATE ON orders
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
        RAISE NOTICE 'Trigger update_orders_updated_at created successfully';
    ELSE
        RAISE NOTICE 'Trigger update_orders_updated_at already exists';
    END IF;
END $$;

-- 6. Перевірити фінальну структуру
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    CASE 
        WHEN column_name = 'id' THEN 'Primary Key'
        WHEN column_name = 'order_number' THEN 'Unique Index'
        WHEN column_name = 'created_at' THEN 'Index'
        WHEN column_name = 'updated_at' THEN 'Index + Trigger'
        ELSE 'Regular Column'
    END as special_properties
FROM information_schema.columns 
WHERE table_name = 'orders' 
ORDER BY ordinal_position;

-- 7. Перевірити індекси
SELECT 
    indexname, 
    indexdef
FROM pg_indexes 
WHERE tablename = 'orders'
ORDER BY indexname;
