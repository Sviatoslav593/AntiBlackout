-- Створення таблиці для логування імпорту товарів
-- Виконайте цей SQL запит в Supabase Dashboard → SQL Editor

CREATE TABLE IF NOT EXISTS import_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  success BOOLEAN NOT NULL,
  imported INTEGER DEFAULT 0,
  updated INTEGER DEFAULT 0,
  errors INTEGER DEFAULT 0,
  total_processed INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Створити індекс для швидкого пошуку
CREATE INDEX IF NOT EXISTS idx_import_logs_created_at ON import_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_import_logs_success ON import_logs(success);

-- Додати коментарі до таблиці
COMMENT ON TABLE import_logs IS 'Логи автоматического импорта товаров из XML фида';
COMMENT ON COLUMN import_logs.success IS 'Успешность импорта';
COMMENT ON COLUMN import_logs.imported IS 'Количество новых товаров';
COMMENT ON COLUMN import_logs.updated IS 'Количество обновленных товаров';
COMMENT ON COLUMN import_logs.errors IS 'Количество ошибок';
COMMENT ON COLUMN import_logs.total_processed IS 'Общее количество обработанных товаров';
COMMENT ON COLUMN import_logs.error_message IS 'Сообщение об ошибке (если есть)';
