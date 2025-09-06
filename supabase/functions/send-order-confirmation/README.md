# 📧 Supabase Edge Function: Order Confirmation Email

## Опис

Edge Function для автоматичного відправлення професійного email підтвердження замовлення клієнтам після оформлення замовлення.

## Функціональність

- ✅ Приймає JSON з даними замовлення та клієнта
- ✅ Генерує професійний HTML email з сучасним дизайном
- ✅ Підтримує українську мову з UTF-8 кодуванням
- ✅ Адаптивний дизайн для мобільних пристроїв
- ✅ Використовує SMTP (Gmail) або Resend API
- ✅ Включає детальну таблицю товарів
- ✅ Кнопка "Відстежити замовлення"
- ✅ Контактна інформація компанії

## Структура запиту

### POST `/functions/v1/send-order-confirmation`

```json
{
  "order": {
    "id": "uuid-string",
    "status": "pending",
    "total_price": 2500,
    "items": [
      {
        "name": "PowerMax 20000мАг Швидка Зарядка",
        "quantity": 2,
        "price": 1200
      },
      {
        "name": "Кабель USB-C 2m",
        "quantity": 1,
        "price": 100
      }
    ]
  },
  "customer": {
    "email": "customer@example.com",
    "name": "Іван Петренко"
  }
}
```

## Змінні середовища

### Для Gmail SMTP:

```bash
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=your-app-password
```

### Для Resend API (рекомендовано):

```bash
RESEND_API_KEY=re_xxxxxxxxx
```

### Для SMTP2GO (альтернатива):

```bash
SMTP2GO_API_KEY=api-xxxxxxxxx
```

## Встановлення

### 1. Встановлення Supabase CLI

```bash
npm install -g supabase
```

### 2. Логін в Supabase

```bash
supabase login
```

### 3. Деплой Edge Function

```bash
supabase functions deploy send-order-confirmation
```

### 4. Встановлення змінних середовища

```bash
supabase secrets set SMTP_USER=your-gmail@gmail.com
supabase secrets set SMTP_PASS=your-app-password
# або
supabase secrets set RESEND_API_KEY=re_xxxxxxxxx
```

## Використання

### З Next.js API Route:

```typescript
// pages/api/send-confirmation.ts
export default async function handler(req, res) {
  const response = await fetch(
    `${process.env.SUPABASE_URL}/functions/v1/send-order-confirmation`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        order: {
          id: orderId,
          status: "pending",
          total_price: totalAmount,
          items: orderItems,
        },
        customer: {
          email: customerEmail,
          name: customerName,
        },
      }),
    }
  );

  const result = await response.json();
  return res.status(200).json(result);
}
```

### З фронтенду:

```typescript
const sendOrderConfirmation = async (orderData, customerData) => {
  const response = await fetch("/api/send-confirmation", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      order: orderData,
      customer: customerData,
    }),
  });

  return await response.json();
};
```

## Структура email

### Заголовок

- Логотип компанії "⚡ AntiBlackout"
- Привітання з іменем клієнта

### Основна частина

- Номер замовлення
- Статус замовлення
- Таблиця товарів з деталями
- Загальна сума
- Кнопка "Відстежити замовлення"

### Інформаційний блок

- Очікування повідомлення від менеджера
- Процес обробки замовлення

### Футер

- Контактна інформація
- Email, Telegram, адреса
- Подяка клієнту

## Відповідь API

### Успішна відповідь:

```json
{
  "success": true,
  "message": "Order confirmation email sent successfully",
  "orderId": "uuid-string",
  "customerEmail": "customer@example.com"
}
```

### Помилка:

```json
{
  "success": false,
  "error": "Failed to send order confirmation email",
  "details": "Error message"
}
```

## Тестування

### Локальне тестування:

```bash
supabase functions serve send-order-confirmation
```

### Тестовий запит:

```bash
curl -X POST http://localhost:54321/functions/v1/send-order-confirmation \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "order": {
      "id": "test-order-123",
      "status": "pending",
      "total_price": 1500,
      "items": [
        {
          "name": "Тестовий товар",
          "quantity": 1,
          "price": 1500
        }
      ]
    },
    "customer": {
      "email": "test@example.com",
      "name": "Тест Тестович"
    }
  }'
```

## Особливості

### Безпека

- ✅ Валідація вхідних даних
- ✅ CORS заголовки
- ✅ Безпечне зберігання credentials
- ✅ Обробка помилок

### Продуктивність

- ✅ Асинхронна обробка
- ✅ Fallback на різні email сервіси
- ✅ Оптимізований HTML
- ✅ Мінімальний розмір

### UX

- ✅ Адаптивний дизайн
- ✅ Сучасний UI
- ✅ Зрозуміла структура
- ✅ Українська мова

## Підтримка

При виникненні проблем:

1. Перевірте логи Edge Function в Supabase Dashboard
2. Переконайтеся, що змінні середовища встановлені правильно
3. Перевірте валідність email адрес
4. Переконайтеся, що SMTP credentials правильні

---

**Версія**: 1.0.0  
**Автор**: AntiBlackout Team  
**Дата**: 5 січня 2025
