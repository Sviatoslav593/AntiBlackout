# Debugging Instructions for Product Images and Email Issues

## 🔍 **Проблеми для дослідження:**

1. **Фото товарів не відображаються** на сторінці замовлення після онлайн оплати
2. **Email повідомлення не надходять** після онлайн оплати

## 🧪 **Тестові API Endpoints**

### **1. Тестування Email сервісу**

```bash
curl -X POST http://localhost:3000/api/test-email-debug
```

**Що перевіряє:**

- Чи є RESEND_API_KEY в environment variables
- Чи працює функція sendOrderEmails
- Чи правильно форматується замовлення для email

### **2. Тестування Order Items**

```bash
curl -X GET http://localhost:3000/api/test-order-items
```

**Що перевіряє:**

- Останнє замовлення в базі даних
- Order items з product_id та products JOIN
- Чи правильно завантажуються фото товарів
- Статистика по товарах з фото та без фото

## 🔧 **Додане логування**

### **В API `/api/order/get`:**

```typescript
console.log(
  "[/api/order/get] Raw items data:",
  JSON.stringify(itemsData, null, 2)
);

console.log("[/api/order/get] Processing item:", {
  id: i.id,
  product_name: i.product_name,
  product_id: i.product_id,
  products: i.products,
  image_url: i.products?.image_url,
  final_image: processedItem.product_image,
});
```

### **В OrderSuccessContent:**

```typescript
console.log(
  "🖼️ API items with images:",
  orderData.items.map((item: any) => ({
    id: item.id,
    name: item.product_name,
    image: item.product_image,
    hasImage: !!item.product_image,
  }))
);

console.log("🖼️ Processing item for display:", {
  id: item.id,
  name: item.name,
  image_url: item.image_url,
  hasImage: !!item.image_url,
});
```

## 📋 **Кроки для діагностики**

### **Крок 1: Перевірка Email**

1. Запустіть сервер: `npm run dev`
2. Відкрийте: `http://localhost:3000/api/test-email-debug`
3. Перевірте консоль сервера на логи
4. Перевірте чи є RESEND_API_KEY в `.env.local`

### **Крок 2: Перевірка Order Items**

1. Відкрийте: `http://localhost:3000/api/test-order-items`
2. Перевірте чи є замовлення в базі даних
3. Перевірте чи правильно завантажуються order_items
4. Перевірте чи є product_id в order_items
5. Перевірте чи працює JOIN з products таблицею

### **Крок 3: Тестування повного флоу**

1. Зробіть тестове замовлення з онлайн оплатою
2. Перевірте логи в консолі браузера
3. Перевірте логи сервера
4. Перевірте чи створюється замовлення в базі даних
5. Перевірте чи створюються order_items з правильними product_id

## 🐛 **Можливі проблеми**

### **Проблема 1: Product ID не зберігається**

**Симптоми:** order_items мають product_id = null або неправильний UUID
**Рішення:** Перевірити функцію getProductUUID в LiqPay callback

### **Проблема 2: JOIN не працює**

**Симптоми:** products об'єкт null в API відповіді
**Рішення:** Перевірити чи існує product_id в products таблиці

### **Проблема 3: Email не надсилається**

**Симптоми:** RESEND_API_KEY відсутній або неправильний
**Рішення:** Перевірити environment variables

### **Проблема 4: LiqPay callback не викликається**

**Симптоми:** Замовлення не створюється після оплати
**Рішення:** Перевірити LiqPay налаштування та callback URL

## 📊 **Очікувані результати**

### **Успішний тест Email:**

```json
{
  "success": true,
  "message": "Test email sent",
  "result": {
    "customerEmail": { "success": true },
    "adminEmail": { "success": true }
  },
  "environment": {
    "hasResendKey": true,
    "resendKeyLength": 32
  }
}
```

### **Успішний тест Order Items:**

```json
{
  "success": true,
  "order": {
    "id": "liqpay_123",
    "customer_name": "Test User",
    "payment_method": "online"
  },
  "items": [
    {
      "id": "item_1",
      "product_name": "Product Name",
      "product_id": "uuid-here",
      "product_image": "https://example.com/image.jpg",
      "has_image": true
    }
  ],
  "summary": {
    "total_items": 1,
    "items_with_images": 1,
    "items_without_images": 0
  }
}
```

## 🚀 **Наступні кроки**

1. **Запустіть тести** та перевірте результати
2. **Проаналізуйте логи** в консолі браузера та сервера
3. **Перевірте базу даних** на наявність замовлень та order_items
4. **Перевірте environment variables** для email сервісу
5. **Повідомте про результати** для подальшого debugging

## 📝 **Логи для аналізу**

### **В консолі браузера шукайте:**

- `🖼️ API items with images:`
- `🖼️ Processing item for display:`
- `✅ Order loaded from API:`
- `✅ Order loaded from localStorage:`

### **В консолі сервера шукайте:**

- `[/api/order/get] Raw items data:`
- `[/api/order/get] Processing item:`
- `📧 Starting email sending process`
- `✅ Confirmation email sent`
- `❌ Email sending failed`

**Ці логи допоможуть точно визначити де саме виникає проблема!** 🔍
