-- Додати колонку images до таблиці products для зберігання всіх зображень товару
ALTER TABLE products ADD COLUMN IF NOT EXISTS images TEXT[];

-- Оновити існуючі записи, щоб images містив поточне image_url
UPDATE products SET images = ARRAY[image_url] WHERE images IS NULL;

-- Додати індекс для швидкого пошуку
CREATE INDEX IF NOT EXISTS idx_products_images ON products USING GIN(images);
