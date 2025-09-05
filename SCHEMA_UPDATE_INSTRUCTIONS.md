# 🔧 Оновлення схеми бази даних для збереження назв товарів

## ❌ Поточна проблема

API працює, але не зберігає назви товарів через відсутність колонок `product_name` та `product_price` в таблиці `order_items`.

## ✅ Рішення

### Крок 1: Відкрийте Supabase Dashboard

1. Перейдіть на: https://supabase.com/dashboard
2. Увійдіть в свій акаунт
3. Виберіть проект: `gtizpymstxfjyidhzygd`

### Крок 2: Відкрийте SQL Editor

1. В лівому меню натисніть **"SQL Editor"**
2. Натисніть **"New query"** (Новий запит)

### Крок 3: Виконайте SQL

Скопіюйте та вставте наведений нижче SQL код:

```sql
-- Add new columns to order_items table
ALTER TABLE order_items
ADD COLUMN IF NOT EXISTS product_name TEXT,
ADD COLUMN IF NOT EXISTS product_price NUMERIC;

-- Update existing records to have product_name and product_price
UPDATE order_items
SET
  product_name = 'Unknown Product',
  product_price = price
WHERE product_name IS NULL;

-- Make product_name NOT NULL for new records
ALTER TABLE order_items
ALTER COLUMN product_name SET NOT NULL;

-- Make product_price NOT NULL for new records
ALTER TABLE order_items
ALTER COLUMN product_price SET NOT NULL;
```

### Крок 4: Натисніть "Run"

Виконайте SQL запит.

## 🧪 Після оновлення схеми

### 1. Перевірте схему:

```bash
npm run check:order-items
```

**Очікуваний результат:**

```
✅ Insert test successful - schema is correct!
```

### 2. Оновіть код для використання нових колонок:

```bash
# Відкоментуйте рядки в src/services/orders.ts
```

### 3. Протестуйте створення замовлення:

```bash
node test-order-with-product-names.js
```

## 🔄 Оновлення коду після схеми

### 1. Відкоментуйте рядки в `src/services/orders.ts`:

```typescript
// Create order items
const orderItems = orderData.items.map((item) => ({
  order_id: order.id,
  product_id: item.product_id,
  product_name: item.product_name, // ✅ Відкоментувати
  product_price: item.product_price, // ✅ Відкоментувати
  quantity: item.quantity,
  price: item.price,
}));
```

### 2. Перезапустіть сервер:

```bash
npm run dev
```

## 📊 Результат після оновлення

### Таблиця `order_items` буде містити:

- ✅ `id` - UUID (первинний ключ)
- ✅ `order_id` - ID замовлення
- ✅ `product_id` - ID товару (може бути NULL)
- ✅ `product_name` - **Назва товару на момент покупки**
- ✅ `product_price` - **Ціна товару на момент покупки**
- ✅ `quantity` - Кількість
- ✅ `price` - Загальна ціна
- ✅ `created_at` - Дата створення

## 🎯 Переваги після оновлення

1. **Історична точність** - назви товарів зберігаються на момент покупки
2. **Незалежність** - замовлення працюють навіть якщо товар видалений
3. **Повна інформація** - всі дані про товар в одному місці

## 🔧 Доступні команди

- `npm run check:order-items` - Перевірити поточну схему
- `npm run update:schema` - Показати SQL для оновлення
- `node test-order-with-product-names.js` - Тест створення замовлення
- `npm run test:supabase` - Тест підключення

## ✅ Статус

- ✅ API працює (тимчасово без назв товарів)
- ⏳ Потрібно виконати SQL в Supabase Dashboard
- ⏳ Потрібно оновити код після схеми
- ⏳ Потрібно протестувати повну функціональність

---

**Наступний крок**: Виконайте SQL в Supabase Dashboard для додавання колонок `product_name` та `product_price`.
