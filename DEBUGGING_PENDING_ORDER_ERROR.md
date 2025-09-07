# Debugging Pending Order Error

## ❌ **Проблема:**

```
❌ Failed to create payment session: Error: Failed to create pending order
```

## 🔍 **Діагностика:**

### **Крок 1: Перевірка тестового endpoint**

```bash
# Відкрийте в браузері:
http://localhost:3000/api/test-pending-order
```

**POST дані для тесту:**

```json
{
  "orderId": "test_order_123",
  "customerData": {
    "name": "Test User",
    "email": "test@example.com",
    "phone": "+380123456789",
    "city": "Київ",
    "branch": "Відділення №1"
  },
  "items": [
    {
      "id": "1",
      "name": "Test Product",
      "price": 500,
      "quantity": 2,
      "image": "https://example.com/image.jpg"
    }
  ],
  "totalAmount": 1000
}
```

### **Крок 2: Перевірка логів сервера**

Після спроби створення замовлення перевірте консоль сервера на:

```
🔄 Creating pending order...
📋 Creating pending order: { orderId: "...", customerName: "...", ... }
📋 Full request body: { ... }
📋 Customer data: { ... }
📋 Items: [ ... ]
❌ Error creating pending order: { ... }
```

### **Крок 3: Перевірка структури даних**

Переконайтеся, що передаються правильні дані:

#### **Customer Data має містити:**

- `name` (string)
- `email` (string)
- `phone` (string)
- `city` (string)
- `branch` (string)

#### **Items має бути масивом з:**

- `id` (string)
- `name` (string)
- `price` (number)
- `quantity` (number)
- `image` (string, optional)

#### **totalAmount має бути числом**

## 🐛 **Можливі причини помилки:**

### **1. Відсутні обов'язкові поля**

```json
{
  "error": "Missing required fields",
  "status": 400
}
```

**Рішення:** Перевірити, що всі поля передаються правильно

### **2. Помилка бази даних**

```json
{
  "error": "Failed to create pending order",
  "details": "duplicate key value violates unique constraint",
  "code": "23505"
}
```

**Рішення:** OrderId вже існує, потрібно генерувати унікальний ID

### **3. Помилка валідації UUID**

```json
{
  "error": "Failed to create pending order",
  "details": "invalid input syntax for type uuid",
  "code": "22P02"
}
```

**Рішення:** OrderId не є валідним UUID

### **4. Помилка зовнішнього ключа**

```json
{
  "error": "Failed to create pending order",
  "details": "insert or update on table 'orders' violates foreign key constraint",
  "code": "23503"
}
```

**Рішення:** Перевірити структуру таблиці orders

## 🔧 **Кроки для виправлення:**

### **1. Перевірити LiqPay session API**

Переконайтеся, що `/api/payment/liqpay-session` повертає правильний `orderId`:

```typescript
// В liqpay-session/route.ts
const orderId = `liqpay_${Date.now()}_${Math.random()
  .toString(36)
  .substr(2, 9)}`;
console.log("📋 Generated orderId:", orderId);
```

### **2. Перевірити передачу даних в checkout**

```typescript
// В checkout/page.tsx
console.log("📋 Data being sent to pending order:", {
  orderId: result.orderId,
  customerData,
  items,
  totalAmount: state.total,
});
```

### **3. Перевірити структуру таблиці orders**

```sql
-- Перевірити структуру таблиці
\d orders

-- Перевірити обмеження
SELECT conname, contype, confrelid
FROM pg_constraint
WHERE conrelid = 'orders'::regclass;
```

### **4. Перевірити права доступу**

```sql
-- Перевірити RLS політики
SELECT * FROM pg_policies WHERE tablename = 'orders';
```

## 🧪 **Тестування:**

### **Тест 1: Базове створення замовлення**

```bash
curl -X POST http://localhost:3000/api/test-pending-order \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "test_123",
    "customerData": {
      "name": "Test",
      "email": "test@test.com",
      "phone": "+380123456789",
      "city": "Київ",
      "branch": "Відділення №1"
    },
    "items": [{"id": "1", "name": "Test", "price": 100, "quantity": 1}],
    "totalAmount": 100
  }'
```

### **Тест 2: Перевірка LiqPay session**

```bash
curl -X POST http://localhost:3000/api/payment/liqpay-session \
  -H "Content-Type: application/json" \
  -d '{
    "customerData": {
      "name": "Test",
      "email": "test@test.com",
      "phone": "+380123456789",
      "city": "Київ",
      "branch": "Відділення №1"
    },
    "items": [{"id": "1", "name": "Test", "price": 100, "quantity": 1}],
    "totalAmount": 100
  }'
```

## 📋 **Очікувані результати:**

### **Успішний тест pending order:**

```json
{
  "success": true,
  "message": "Test order creation successful",
  "testOrderId": "test_1234567890",
  "orderData": {
    "id": "test_1234567890",
    "customer_name": "Test",
    "status": "pending_payment",
    ...
  }
}
```

### **Успішний LiqPay session:**

```json
{
  "success": true,
  "orderId": "liqpay_1234567890_abc123",
  "data": "eyJ2ZXJzaW9uIjozLC...",
  "signature": "abc123...",
  ...
}
```

## 🚀 **Наступні кроки:**

1. **Запустіть сервер**: `npm run dev`
2. **Відкрийте тестові endpoints** та перевірте результати
3. **Спробуйте створити замовлення** та перевірте логи
4. **Проаналізуйте помилки** в консолі сервера
5. **Повідомте про результати** для подальшого debugging

**Ці кроки допоможуть точно визначити причину помилки!** 🔍
