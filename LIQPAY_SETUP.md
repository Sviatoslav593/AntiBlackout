# LiqPay Integration Setup

## Environment Variables

Додайте ці змінні до вашого `.env.local` файлу:

```bash
# LiqPay Configuration
LIQPAY_PUBLIC_KEY=sandbox_i1881916757
LIQPAY_PRIVATE_KEY=sandbox_i4PTRrU9ZfD0KCglN0QwJLfcJmbkoj1OJaHnRuWg
```

## Vercel Environment Variables

Для продакшн деплою на Vercel, додайте ці змінні в налаштуваннях проекту:

1. Перейдіть до Vercel Dashboard
2. Виберіть ваш проект
3. Перейдіть до Settings > Environment Variables
4. Додайте:
   - `LIQPAY_PUBLIC_KEY` = `sandbox_i1881916757`
   - `LIQPAY_PRIVATE_KEY` = `sandbox_i4PTRrU9ZfD0KCglN0QwJLfcJmbkoj1OJaHnRuWg`

## Production Keys

Коли будете готові до продакшну, замініть sandbox ключі на реальні:
- Отримайте ключі з LiqPay Merchant Panel
- Замініть `sandbox_` префікси на реальні ключі
- Оновіть environment variables

## API Endpoints

- `POST /api/payment` - Генерує LiqPay data та signature
- `POST /api/payment-callback` - Webhook для оновлення статусу замовлення

## Testing

1. Використовуйте sandbox ключі для тестування
2. Перевірте webhook URL: `https://antiblackout.shop/api/payment-callback`
3. Тестуйте з LiqPay sandbox тестовими картами
