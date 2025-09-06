# LiqPay Environment Variables Setup

## 🚨 IMPORTANT: Environment Variables Required

Для роботи LiqPay інтеграції необхідно налаштувати змінні середовища.

## 📝 Create .env.local file

Створіть файл `.env.local` в корені проекту з наступним вмістом:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://gtizpymstxfjyidhzygd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_fRoo7OWfWcC6GiXA6HTxCg_iYVNHuEX
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0aXpweW1zdHhmanlpZGh6eWdkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzA5MzU5NCwiZXhwIjoyMDcyNjY5NTk0fQ.Jib_mVTHCt3PYnBrl63_V89aEsK20akEIcJFDr7GopE

# Other API Keys
NEXT_PUBLIC_NOVA_POSHTA_API_KEY=c8be07eac251641182e5575f8ee0da40
RESEND_API_KEY=re_A9tvHur2_GCjdi8cvdUY76xMJZxFqhaZ

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://antiblackout.shop

# LiqPay Configuration (Sandbox)
LIQPAY_PUBLIC_KEY=sandbox_i1881916757
LIQPAY_PRIVATE_KEY=sandbox_i4PTRrU9ZfD0KCglN0QwJLfcJmbkoj1OJaHnRuWg
```

## 🔧 Steps to Fix:

1. **Create .env.local file** in project root
2. **Copy the content above** into the file
3. **Restart the development server** (`npm run dev`)
4. **Test the payment flow**

## 🚀 For Production (Vercel):

Додайте ці змінні в Vercel Dashboard:

- `LIQPAY_PUBLIC_KEY` = `sandbox_i1881916757`
- `LIQPAY_PRIVATE_KEY` = `sandbox_i4PTRrU9ZfD0KCglN0QwJLfcJmbkoj1OJaHnRuWg`

## ✅ After Setup:

- LiqPay payments will work correctly
- "Payment service not configured" error will be resolved
- Sandbox payments can be tested

## 🧪 Test Cards:

- **Success**: `4242424242424242`
- **Decline**: `4000000000000002`
- **3D Secure**: `4000000000003220`

## 📞 Support:

Якщо виникли проблеми, перевірте:

1. Файл `.env.local` створено в корені проекту
2. Змінні скопійовані правильно
3. Сервер перезапущено після зміни змінних
