# 🛒 Додавання назв товарів до замовлень

## 📋 Огляд змін

Оновлено логіку оформлення замовлень для збереження назв товарів та цін безпосередньо в таблиці `order_items`. Це забезпечує історичну точність - навіть якщо назва товару зміниться в майбутньому, в історії замовлень залишиться оригінальна назва на момент покупки.

## 🔧 Внесені зміни

### 1. Оновлення TypeScript інтерфейсів

#### `src/lib/supabase.ts`

```typescript
export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string; // ✅ НОВЕ ПОЛЕ
  product_price: number; // ✅ НОВЕ ПОЛЕ
  quantity: number;
  price: number;
  product?: Product;
}
```

#### `src/services/orders.ts`

```typescript
export interface CreateOrderData {
  // ... existing fields
  items: {
    product_id: string | null;
    product_name: string; // ✅ НОВЕ ПОЛЕ
    product_price: number; // ✅ НОВЕ ПОЛЕ
    quantity: number;
    price: number;
  }[];
}
```

### 2. Оновлення логіки створення замовлень

#### `src/app/api/order/route.ts`

```typescript
items: orderData.items.map((item) => ({
  product_id: null,
  product_name: item.name,     // ✅ Назва з кошика
  product_price: item.price,   // ✅ Ціна з кошика
  quantity: item.quantity,
  price: item.price,           // Залишено для сумісності
})),
```

#### `src/services/orders.ts`

```typescript
const orderItems = orderData.items.map((item) => ({
  order_id: order.id,
  product_id: item.product_id,
  product_name: item.product_name, // ✅ Зберігаємо назву
  product_price: item.product_price, // ✅ Зберігаємо ціну
  quantity: item.quantity,
  price: item.price,
}));
```

### 3. Оновлення схеми бази даних

#### SQL для додавання нових колонок:

```sql
-- Додати нові колонки до таблиці order_items
ALTER TABLE order_items
ADD COLUMN IF NOT EXISTS product_name TEXT,
ADD COLUMN IF NOT EXISTS product_price NUMERIC;

-- Оновити існуючі записи
UPDATE order_items
SET
  product_name = 'Unknown Product',
  product_price = price
WHERE product_name IS NULL;

-- Зробити поля обов'язковими для нових записів
ALTER TABLE order_items
ALTER COLUMN product_name SET NOT NULL;
ALTER TABLE order_items
ALTER COLUMN product_price SET NOT NULL;
```

## 🧪 Тестування

### 1. Оновлення схеми бази даних

```bash
npm run update:schema
```

### 2. Тестування створення замовлення

```bash
node test-order-with-product-names.js
```

### 3. Перевірка підключення

```bash
npm run test:supabase
```

## 📊 Структура даних після оновлення

### Таблиця `order_items`:

- ✅ `id` - UUID (первинний ключ)
- ✅ `order_id` - ID замовлення (зв'язок)
- ✅ `product_id` - ID товару (може бути NULL)
- ✅ `product_name` - **Назва товару на момент покупки**
- ✅ `product_price` - **Ціна товару на момент покупки**
- ✅ `quantity` - Кількість
- ✅ `price` - Загальна ціна (quantity × product_price)
- ✅ `created_at` - Дата створення

## 🎯 Переваги нового підходу

### 1. **Історична точність**

- Назви товарів зберігаються на момент покупки
- Зміни в каталозі не впливають на історію замовлень

### 2. **Незалежність від таблиці продуктів**

- Замовлення можуть існувати навіть якщо товар видалений
- Менше залежностей між таблицями

### 3. **Повна інформація про замовлення**

- Всі дані про товар зберігаються в одному місці
- Легше аналізувати історію продажів

## 🔄 Порівняння до/після

### До оновлення:

```javascript
// order_items записував тільки:
{
  order_id: "uuid",
  product_id: null,
  quantity: 2,
  price: 2400
}
```

### Після оновлення:

```javascript
// order_items записує повну інформацію:
{
  order_id: "uuid",
  product_id: null,
  product_name: "PowerMax 20000мАг Швидка Зарядка",
  product_price: 1200,
  quantity: 2,
  price: 2400
}
```

## 🚀 Наступні кроки

### 1. Виконати SQL в Supabase Dashboard

- Скопіювати SQL з `npm run update:schema`
- Виконати в SQL Editor

### 2. Протестувати функціональність

- Запустити `node test-order-with-product-names.js`
- Перевірити створення замовлення через UI

### 3. Оновити відображення замовлень

- Можна використовувати `product_name` замість пошуку в таблиці продуктів
- Покращити відображення деталей замовлення

## 🔧 Доступні команди

- `npm run update:schema` - Показати SQL для оновлення схеми
- `npm run test:supabase` - Тест підключення
- `npm run dev` - Запуск сервера
- `node test-order-with-product-names.js` - Тест створення замовлення

## ✅ Статус

- ✅ TypeScript інтерфейси оновлені
- ✅ API endpoint оновлений
- ✅ OrderService оновлений
- ⏳ Потрібно виконати SQL в Supabase Dashboard
- ⏳ Потрібно протестувати функціональність

---

**Дата оновлення**: 5 січня 2025  
**Статус**: 🔄 В процесі  
**Наступний крок**: Виконати SQL в Supabase Dashboard
