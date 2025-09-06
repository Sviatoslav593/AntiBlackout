# 🔧 Environment Variables Setup

## Required Environment Variables

Create a `.env.local` file in the project root with the following variables:

```bash
# Supabase Configuration
# Get these values from your Supabase project dashboard: Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Service Role Key (for server-side operations)
# Get this from your Supabase project dashboard: Settings → API → service_role key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Nova Poshta API Key
NEXT_PUBLIC_NOVA_POSHTA_API_KEY=your-nova-poshta-api-key

# Resend API Key (for email sending)
RESEND_API_KEY=your-resend-api-key
```

## How to Get Supabase Keys

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy the following values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

## Vercel Deployment

For Vercel deployment, add these environment variables in:

1. Go to your Vercel Dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add all the variables listed above

## Important Notes

- ⚠️ **Never commit `.env.local` to version control**
- ✅ The `.env.local` file is already in `.gitignore`
- 🔒 Keep your service role key secure - it has admin access to your database
- 🌐 Public keys (NEXT*PUBLIC*\*) are safe to expose in client-side code
