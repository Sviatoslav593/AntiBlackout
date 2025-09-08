-- Виправити схему таблиці import_logs - додати колонку added_count
-- Виконайте цей SQL запит в Supabase Dashboard → SQL Editor

-- Додати колонку added_count до таблиці import_logs
ALTER TABLE import_logs 
ADD COLUMN IF NOT EXISTS added_count INTEGER DEFAULT 0;

-- Оновити коментарі
COMMENT ON COLUMN import_logs.added_count IS 'Кількість нових товарів (доданих)';
COMMENT ON COLUMN import_logs.imported IS 'Кількість імпортованих товарів (загальна)';
COMMENT ON COLUMN import_logs.updated IS 'Кількість оновлених товарів';
