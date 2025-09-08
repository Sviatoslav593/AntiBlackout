# 📦 Налаштування XML імпорту товарів

## 🎯 Огляд

Система автоматичного імпорту товарів з XML фіду `https://mma.in.ua/feed/xml/iDxAyRECF.xml` з наступними функціями:

- **Автоматичний імпорт** кожні 2 години
- **Upsert логіка** (оновлення існуючих, додавання нових)
- **Валідація даних** з обробкою помилок
- **Логування результатів** в базу даних
- **Адмін-панель** для управління

## 🔧 Налаштування

### 1. База даних

Виконайте SQL скрипти в Supabase Dashboard:

```sql
-- 1. Оновити схему products
-- Виконати update-products-schema.sql

-- 2. Створити таблицю логів
-- Виконати create-import-logs-table.sql
```

### 2. Змінні середовища

Додайте до `.env.local`:

```bash
# Cron секрет для безпеки
CRON_SECRET=your-secure-cron-secret

# Існуючі змінні (якщо ще не налаштовані)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 3. Cron Job налаштування

#### Варіант A: Vercel Cron Jobs

Додайте до `vercel.json`:

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

#### Варіант B: External Cron Service

Налаштуйте зовнішній сервіс (наприклад, cron-job.org):

- **URL**: `https://antiblackout.shop/api/cron/import-products`
- **Schedule**: `0 */2 * * *` (кожні 2 години)
- **Headers**: `Authorization: Bearer your-secure-cron-secret`

## 📊 Структура даних

### XML → Database Mapping

| XML Field | Database Column | Type | Notes |
|-----------|----------------|------|-------|
| `<code>` | `external_id` | TEXT | Унікальний ідентифікатор |
| `<name>` | `name` | TEXT | Назва товару |
| `<description>` | `description` | TEXT | Опис товару |
| `<price>` | `price` | NUMERIC(10,2) | Ціна в UAH |
| `<brand>` | `brand` | TEXT | Бренд |
| `<category>` | `category` | TEXT | Категорія |
| `<quantity_in_stock>` | `quantity` | INTEGER | Кількість на складі |
| `<image>` | `image_url` | TEXT | URL зображення |
| - | `currency` | TEXT | Жорстко "UAH" |
| - | `id` | UUID | Генерується автоматично |
| - | `created_at` | TIMESTAMP | Час створення |
| - | `updated_at` | TIMESTAMP | Час оновлення |

### Валідація даних

- **Обов'язкові поля**: `external_id`, `name`
- **Ціна**: `>= 0`, fallback до 0
- **Кількість**: `>= 0`, fallback до 0
- **Назва**: не може бути порожньою
- **Валюта**: завжди "UAH"

## 🚀 API Endpoints

### 1. Ручний імпорт

```bash
POST /api/products/import
```

**Відповідь:**
```json
{
  "success": true,
  "message": "Products imported successfully",
  "stats": {
    "total": 150,
    "valid": 145,
    "invalid": 5,
    "imported": 20,
    "updated": 125,
    "errors": 0
  }
}
```

### 2. Перевірка статусу

```bash
GET /api/products/import
```

**Відповідь:**
```json
{
  "success": true,
  "stats": {
    "total": 150,
    "withExternalId": 145,
    "withPrice": 140,
    "inStock": 120,
    "withImages": 130
  }
}
```

### 3. Очистка фейкових товарів

```bash
POST /api/products/cleanup
```

**Відповідь:**
```json
{
  "success": true,
  "stats": {
    "total": 150,
    "deleted": 10,
    "kept": 140
  }
}
```

### 4. Cron імпорт

```bash
GET /api/cron/import-products
Authorization: Bearer your-secure-cron-secret
```

## 🎛️ Адмін-панель

### Доступ: `/admin/products`

**Функції:**
- **Статистика товарів** - загальна інформація
- **Ручний імпорт** - запуск імпорту вручну
- **Перевірка фейкових** - аналіз фейкових товарів
- **Очистка фейкових** - видалення фейкових товарів
- **Логи імпорту** - історія імпортів

### Статистика

- **Всього товарів** - загальна кількість
- **Імпортованих** - з external_id
- **З ціною** - з валідною ціною
- **В наявності** - з quantity > 0
- **З фото** - з image_url

## 🔄 Логіка імпорту

### 1. Отримання XML

```typescript
const products = await parseXMLFeed(XML_FEED_URL);
```

### 2. Валідація

```typescript
const { valid, invalid, stats } = validateProducts(products);
```

### 3. Upsert в базу

```typescript
for (const product of valid) {
  const existing = await findProductByExternalId(product.external_id);
  
  if (existing) {
    await updateProduct(existing.id, product);
  } else {
    await createProduct(product);
  }
}
```

### 4. Логування

```typescript
await logImportResult({
  success: true,
  imported: 20,
  updated: 125,
  errors: 0,
  timestamp: new Date().toISOString()
});
```

## 🛡️ Безпека

### 1. Cron Secret

- **Змінна**: `CRON_SECRET`
- **Використання**: `Authorization: Bearer {secret}`
- **Рекомендація**: Використовуйте складний пароль

### 2. Валідація даних

- **XML парсинг** з обробкою помилок
- **Типізація** всіх полів
- **Sanitization** вхідних даних
- **Fallback значення** для відсутніх полів

### 3. Обмеження

- **Rate limiting** для API
- **Timeout** для XML запитів
- **Retry логіка** при помилках

## 📈 Моніторинг

### 1. Логи в базі даних

Таблиця `import_logs` містить:
- **success** - успішність імпорту
- **imported** - кількість нових товарів
- **updated** - кількість оновлених товарів
- **errors** - кількість помилок
- **error_message** - текст помилки
- **created_at** - час імпорту

### 2. Консольні логи

```bash
# Успішний імпорт
✅ Import completed: 20 imported, 125 updated, 0 errors

# Помилка
❌ Error in scheduled import: XML parsing failed
```

### 3. Email сповіщення (опціонально)

Можна додати відправку email при помилках:

```typescript
if (importResult.errors > 0) {
  await sendErrorNotification(importResult);
}
```

## 🔧 Налагодження

### 1. Тестування XML фіду

```bash
curl "https://mma.in.ua/feed/xml/iDxAyRECF.xml" | head -20
```

### 2. Тестування API

```bash
# Ручний імпорт
curl -X POST "https://antiblackout.shop/api/products/import"

# Перевірка статусу
curl "https://antiblackout.shop/api/products/import"
```

### 3. Перевірка логів

```sql
SELECT * FROM import_logs 
ORDER BY created_at DESC 
LIMIT 10;
```

## 🚨 Важливо

1. **Виконайте SQL скрипти** перед використанням
2. **Налаштуйте CRON_SECRET** для безпеки
3. **Протестуйте імпорт** вручну перед налаштуванням cron
4. **Моніторьте логи** для виявлення проблем
5. **Резервне копіювання** перед очисткою фейкових товарів

## 📞 Підтримка

При проблемах:
1. Перевірте логи в `import_logs` таблиці
2. Перевірте консольні логи сервера
3. Переконайтеся, що XML фід доступний
4. Перевірте підключення до Supabase
5. Перевірте валідність CRON_SECRET
