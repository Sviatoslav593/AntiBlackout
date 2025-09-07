# Vercel Environment Variables Setup

## Required Environment Variables for Vercel

Add these environment variables in your Vercel dashboard under Settings > Environment Variables:

### Supabase Configuration
```
NEXT_PUBLIC_SUPABASE_URL=https://gtizpymstxfjyidhzygd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_fRoo7OWfWcC6GiXA6HTxCg_iYVNHuEX
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0aXzpyW1zdHhmanlpZGh6eWdkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzA5MzU5NCwiZXhwIjoyMDcyNjY5NTk0fQ.Jib_mVTHCt3PYnBrl63_V89aEsK20akEIcJFDr7GopE
```

### LiqPay Configuration
```
LIQPAY_PUBLIC_KEY=sandbox_i1881916757
LIQPAY_PRIVATE_KEY=sandbox_i4PTRrU9ZfD0KCglN0QwJLfcJmbkoj1OJaHnRuWg
```

### Email Configuration
```
RESEND_API_KEY=re_A9tvHur2_GCjdi8cvdUY76xMJZxFqFhaZ
```

### Site Configuration
```
NEXT_PUBLIC_SITE_URL=https://antiblackout.shop
```

### Nova Poshta API
```
NEXT_PUBLIC_NOVA_POSHTA_API_KEY=c8be07eac251641182e5575f8ee0da40
```

## Important Notes

1. **SUPABASE_SERVICE_ROLE_KEY** is used for server-side operations and has full access to your database
2. **NEXT_PUBLIC_SUPABASE_URL** and **NEXT_PUBLIC_SUPABASE_ANON_KEY** are used for client-side operations
3. Make sure to set these variables for all environments (Production, Preview, Development)
4. After adding variables, redeploy your application

## Verification

To verify the setup, check the Vercel function logs after deployment:
1. Go to Vercel Dashboard
2. Select your project
3. Go to Functions tab
4. Check logs for any environment variable errors

## Common Issues

1. **Missing SUPABASE_SERVICE_ROLE_KEY**: This will cause 500 errors in `/api/order/create`
2. **Wrong Supabase URL**: This will cause connection errors
3. **Missing LiqPay keys**: This will cause payment preparation to fail
4. **Missing RESEND_API_KEY**: This will cause email sending to fail

## Testing

After setting up environment variables, test the order creation:
1. Go to your deployed site
2. Add items to cart
3. Go to checkout
4. Fill out the form
5. Try both COD and LiqPay payment methods
6. Check Vercel function logs for any errors
