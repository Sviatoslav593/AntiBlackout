# LiqPay Integration - Complete Implementation

## 🎯 Overview

Повна інтеграція LiqPay для онлайн платежів у Next.js e-commerce проекті AntiBlackout.

## 🔧 Implementation Details

### 1. Environment Variables

Додайте до `.env.local`:

```bash
# LiqPay Configuration
LIQPAY_PUBLIC_KEY=sandbox_i1881916757
LIQPAY_PRIVATE_KEY=sandbox_i4PTRrU9ZfD0KCglN0QwJLfcJmbkoj1OJaHnRuWg
```

### 2. API Endpoints

#### `/api/payment` (POST)
Генерує LiqPay data та signature для платежу.

**Request:**
```json
{
  "amount": 1000,
  "description": "Замовлення #12345 - AntiBlackout",
  "orderId": "12345",
  "currency": "UAH"
}
```

**Response:**
```json
{
  "success": true,
  "data": "base64_encoded_liqpay_data",
  "signature": "sha1_signature",
  "orderId": "12345"
}
```

#### `/api/payment-callback` (POST)
Webhook endpoint для обробки статусів платежів від LiqPay.

**LiqPay Callback Data:**
- `data` - base64 encoded JSON з даними платежу
- `signature` - SHA1 signature для верифікації

### 3. Frontend Components

#### `LiqPayPaymentForm`
React компонент для відображення форми оплати LiqPay.

**Props:**
- `amount` - сума до сплати
- `description` - опис платежу
- `orderId` - ID замовлення
- `onPaymentInitiated` - callback при ініціації платежу
- `onPaymentSuccess` - callback при успішній оплаті
- `onPaymentError` - callback при помилці

### 4. Checkout Flow

1. **Користувач заповнює форму** замовлення
2. **При виборі "Онлайн оплата"** - створюється замовлення в Supabase
3. **Показується LiqPay форма** з кнопкою оплати
4. **При натисканні** - генерується data/signature через API
5. **Автоматичне перенаправлення** на LiqPay для оплати
6. **Після оплати** - користувач повертається на `/order-success`
7. **Webhook оновлює** статус замовлення в Supabase

### 5. Database Schema

Додано поля до таблиці `orders`:

```sql
-- Payment status from LiqPay
payment_status VARCHAR(50) DEFAULT 'pending'

-- LiqPay payment/transaction ID
payment_id VARCHAR(255)

-- Payment method used
payment_method VARCHAR(50) DEFAULT 'cash_on_delivery'
```

## 🔒 Security Features

### 1. Signature Verification
- Всі callback'и від LiqPay верифікуються через SHA1 signature
- Приватний ключ ніколи не передається на frontend

### 2. Environment Variables
- Ключі зберігаються в environment variables
- Різні ключі для sandbox та production

### 3. Error Handling
- Graceful обробка помилок платежів
- Логування всіх операцій для debugging

## 🚀 Usage

### 1. Setup Environment
```bash
# Add to .env.local
LIQPAY_PUBLIC_KEY=your_public_key
LIQPAY_PRIVATE_KEY=your_private_key
```

### 2. Update Database Schema
```bash
npm run ts-node scripts/update-orders-payment-schema.ts
```

### 3. Test Integration
1. Виберіть "Оплата карткою онлайн" на checkout
2. Заповніть форму замовлення
3. Натисніть "Оплатити" в LiqPay формі
4. Використайте тестові дані LiqPay sandbox

## 📱 LiqPay Sandbox Testing

### Test Cards
- **Success:** 4242424242424242
- **Failure:** 4000000000000002
- **3D Secure:** 4000000000003220

### Test Data
- **CVV:** будь-які 3 цифри
- **Expiry:** будь-яка майбутня дата
- **Name:** будь-яке ім'я

## 🔄 Payment Status Flow

```
pending → success/failure/error/reversed
```

### Status Mapping
- `success` → `paid`
- `failure` → `failed`
- `error` → `error`
- `reversed` → `refunded`

## 📊 Monitoring

### Logs
Всі операції логуються в консоль:
- 💳 Payment data generation
- 📞 LiqPay callbacks
- ✅ Successful payments
- ❌ Payment errors

### Database Updates
Статус замовлення автоматично оновлюється в Supabase при отриманні callback'у.

## 🛠️ Production Setup

### 1. Replace Sandbox Keys
```bash
# In .env.local
LIQPAY_PUBLIC_KEY=your_production_public_key
LIQPAY_PRIVATE_KEY=your_production_private_key
```

### 2. Update Vercel Environment
Додайте змінні в Vercel Dashboard:
- `LIQPAY_PUBLIC_KEY`
- `LIQPAY_PRIVATE_KEY`

### 3. Configure Webhook URL
В LiqPay Merchant Panel встановіть:
- **Server URL:** `https://antiblackout.shop/api/payment-callback`
- **Result URL:** `https://antiblackout.shop/order-success`

## ✅ Features Implemented

- [x] LiqPay API integration
- [x] Secure signature generation
- [x] Webhook callback handling
- [x] Frontend payment form
- [x] Database schema updates
- [x] Error handling
- [x] Sandbox testing support
- [x] Production ready configuration

## 🎉 Result

Повнофункціональна інтеграція LiqPay з:
- Безпечною обробкою платежів
- Автоматичним оновленням статусів
- User-friendly інтерфейсом
- Comprehensive error handling
- Production-ready кодом
