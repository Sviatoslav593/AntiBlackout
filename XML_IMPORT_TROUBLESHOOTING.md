# 🔧 XML Import Troubleshooting Guide

## 🚨 Проблема: Товари не з'являються на сайті

### ✅ Що працює:

- XML фід доступний: `https://mma.in.ua/feed/xml/iDxAyRECF.xml`
- XML парсер працює: знайдено 2934 товари
- Код імпорту написаний правильно

### ❌ Що не працює:

- Змінні середовища не налаштовані
- SQL скрипти не виконані
- База даних не оновлена

## 🔧 Кроки для виправлення:

### 1. Налаштування змінних середовища

Створіть файл `.env.local` в корені проекту:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# LiqPay Configuration
LIQPAY_PUBLIC_KEY=your_liqpay_public_key_here
LIQPAY_PRIVATE_KEY=your_liqpay_private_key_here

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Email Configuration
RESEND_API_KEY=your_resend_api_key_here

# Admin Configuration
ADMIN_USER=admin
ADMIN_PASS=secret123

# Cron Configuration
CRON_SECRET=your-secure-cron-secret-here
```

### 2. Виконання SQL скриптів

Виконайте в Supabase Dashboard → SQL Editor:

#### A. Оновлення схеми products таблиці:

```sql
-- Виконати update-products-schema.sql
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS external_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS price NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS brand TEXT,
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Створити індекси
CREATE INDEX IF NOT EXISTS idx_products_external_id ON products(external_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
```

#### B. Створення таблиці логів:

```sql
-- Виконати create-import-logs-table.sql
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

-- Створити індекси
CREATE INDEX IF NOT EXISTS idx_import_logs_created_at ON import_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_import_logs_success ON import_logs(success);
```

### 3. Тестування імпорту

Після налаштування змінних середовища:

```bash
# 1. Запустити сервер
npm run dev

# 2. Протестувати API імпорту
curl -X POST "http://localhost:3000/api/products/import" | jq

# 3. Перевірити статус товарів
curl "http://localhost:3000/api/products/import" | jq
```

### 4. Перевірка в адмін-панелі

Відкрийте `http://localhost:3000/admin/products` та:

1. **Перевірте статистику** - має показувати кількість товарів
2. **Запустіть ручний імпорт** - кнопка "Імпортувати товари"
3. **Перевірте логи** - внизу сторінки

## 🔍 Діагностика проблем

### Перевірка змінних середовища:

```bash
node -e "console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)"
```

### Перевірка схеми бази даних:

```bash
node check-database-schema.js
```

### Перевірка XML парсера:

```bash
node test-xml-simple.js
```

## 📊 Очікувані результати

Після успішного налаштування:

1. **API імпорту** поверне:

```json
{
  "success": true,
  "message": "Products imported successfully",
  "stats": {
    "total": 2934,
    "valid": 2900,
    "invalid": 34,
    "imported": 2900,
    "updated": 0,
    "errors": 0
  }
}
```

2. **Статистика товарів** покаже:

```json
{
  "success": true,
  "stats": {
    "total": 2900,
    "withExternalId": 2900,
    "withPrice": 2800,
    "inStock": 2500,
    "withImages": 2900
  }
}
```

3. **На головній сторінці** з'являться товари з XML фіду

## 🚀 Автоматичний імпорт

Після налаштування можна налаштувати автоматичний імпорт:

### Vercel Cron Jobs:

```json
{
  "crons": [
    {
      "path": "/api/cron/import-products",
      "schedule": "0 */2 * * *"
    }
  ]
}
```

### External Cron Service:

- URL: `https://antiblackout.shop/api/cron/import-products`
- Headers: `Authorization: Bearer your-secure-cron-secret`
- Schedule: `0 */2 * * *` (кожні 2 години)

## 📞 Підтримка

Якщо проблеми залишаються:

1. Перевірте логи в `import_logs` таблиці
2. Перевірте консольні логи сервера
3. Переконайтеся, що всі змінні середовища налаштовані
4. Перевірте, що SQL скрипти виконані
5. Перевірте підключення до Supabase

## 🎯 Наступні кроки

1. **Налаштуйте змінні середовища** (.env.local)
2. **Виконайте SQL скрипти** в Supabase
3. **Протестуйте імпорт** через API
4. **Перевірте адмін-панель** (/admin/products)
5. **Налаштуйте автоматичний імпорт** (опціонально)
