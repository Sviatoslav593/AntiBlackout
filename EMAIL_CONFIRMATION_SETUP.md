# 📧 Налаштування автоматичного відправлення email підтвердження замовлень

## 🎯 Огляд

Створено Supabase Edge Function для автоматичного відправлення професійного email підтвердження клієнтам після оформлення замовлення.

## 📁 Структура файлів

```
supabase/
├── functions/
│   └── send-order-confirmation/
│       ├── index.ts                    # Основна Edge Function
│       ├── index-nodemailer.ts         # Альтернативна версія з nodemailer
│       ├── deno.json                   # Конфігурація Deno
│       └── README.md                   # Документація Edge Function
├── config.toml                         # Конфігурація Supabase
src/app/api/
└── send-confirmation/
    └── route.ts                        # Next.js API endpoint
```

## 🚀 Швидкий старт

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
# Для Gmail SMTP
supabase secrets set SMTP_USER=your-gmail@gmail.com
supabase secrets set SMTP_PASS=your-app-password

# Або для Resend API (рекомендовано)
supabase secrets set RESEND_API_KEY=re_xxxxxxxxx
```

## ⚙️ Налаштування email сервісів

### Варіант 1: Gmail SMTP (безкоштовно)

1. Увійдіть в Gmail
2. Перейдіть в "Налаштування" → "Безпека"
3. Увімкніть "2-факторна автентифікація"
4. Створіть "Пароль додатку" для SMTP
5. Встановіть змінні:
   ```bash
   SMTP_USER=your-gmail@gmail.com
   SMTP_PASS=your-app-password
   ```

### Варіант 2: Resend API (рекомендовано)

1. Зареєструйтеся на [resend.com](https://resend.com)
2. Отримайте API ключ
3. Встановіть змінну:
   ```bash
   RESEND_API_KEY=re_xxxxxxxxx
   ```

### Варіант 3: SMTP2GO (альтернатива)

1. Зареєструйтеся на [smtp2go.com](https://smtp2go.com)
2. Отримайте API ключ
3. Встановіть змінну:
   ```bash
   SMTP2GO_API_KEY=api-xxxxxxxxx
   ```

## 📧 Структура email

### Заголовок

- ⚡ Логотип "AntiBlackout"
- Персоналізоване привітання

### Основна частина

- Номер замовлення
- Статус замовлення
- Детальна таблиця товарів
- Загальна сума
- Кнопка "Відстежити замовлення"

### Інформаційний блок

- Очікування повідомлення від менеджера
- Процес обробки замовлення

### Футер

- Контактна інформація
- Email, Telegram, адреса
- Подяка клієнту

## 🔧 Використання

### Автоматичне відправлення

Email відправляється автоматично при створенні замовлення через `/api/order` endpoint.

### Ручне відправлення

```typescript
const response = await fetch("/api/send-confirmation", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    order: {
      id: "order-123",
      status: "pending",
      total_price: 2500,
      items: [
        {
          name: "PowerMax 20000мАг",
          quantity: 2,
          price: 1200,
        },
      ],
    },
    customer: {
      email: "customer@example.com",
      name: "Іван Петренко",
    },
  }),
});
```

## 🧪 Тестування

### Локальне тестування

```bash
# Запуск локального сервера
supabase start

# Тестування Edge Function
node test-email-function.js
```

### Тестування в продакшені

```bash
# Деплой Edge Function
supabase functions deploy send-order-confirmation

# Тестування через API
curl -X POST https://your-project.supabase.co/functions/v1/send-order-confirmation \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"order": {...}, "customer": {...}}'
```

## 📊 Переваги

### Для клієнтів

- ✅ Миттєве підтвердження замовлення
- ✅ Детальна інформація про замовлення
- ✅ Зручне відстеження статусу
- ✅ Професійний вигляд

### Для бізнесу

- ✅ Автоматизація процесу
- ✅ Зменшення навантаження на підтримку
- ✅ Покращення UX
- ✅ Збільшення довіри клієнтів

## 🔒 Безпека

### Захист даних

- ✅ Валідація вхідних даних
- ✅ Безпечне зберігання credentials
- ✅ CORS заголовки
- ✅ Обробка помилок

### Обмеження

- ✅ Rate limiting
- ✅ Валідація email адрес
- ✅ Захист від спаму

## 📈 Моніторинг

### Логи

- Перевірте логи Edge Function в Supabase Dashboard
- Відстежуйте успішність відправки email
- Моніторуйте помилки

### Метрики

- Кількість відправлених email
- Час відповіді API
- Статистика помилок

## 🛠️ Налаштування

### Зміна дизайну email

Редагуйте функцію `createEmailHTML()` в `index.ts`

### Зміна тексту

Оновіть шаблон email в функції `createEmailHTML()`

### Додавання полів

Розширте інтерфейси `Order` та `Customer`

## 🆘 Вирішення проблем

### Email не відправляється

1. Перевірте змінні середовища
2. Переконайтеся, що SMTP credentials правильні
3. Перевірте логи Edge Function

### Помилки валідації

1. Переконайтеся, що всі обов'язкові поля передані
2. Перевірте формат email адреси
3. Переконайтеся, що структура даних правильна

### Проблеми з форматуванням

1. Перевірте UTF-8 кодування
2. Переконайтеся, що HTML валідний
3. Тестуйте на різних email клієнтах

## 📞 Підтримка

При виникненні проблем:

1. Перевірте документацію Supabase Edge Functions
2. Перегляньте логи в Supabase Dashboard
3. Переконайтеся, що всі залежності встановлені

---

**Версія**: 1.0.0  
**Дата**: 5 січня 2025  
**Статус**: ✅ Готово до використання
