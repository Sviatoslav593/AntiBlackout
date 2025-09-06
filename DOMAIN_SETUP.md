# Domain Setup Guide for antiblackout.shop

## Environment Variables for Vercel

Add these environment variables to your Vercel project settings:

```bash
# Site Configuration
NEXT_PUBLIC_SITE_URL=https://antiblackout.shop

# Keep your existing Supabase configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Keep your existing API keys
NEXT_PUBLIC_NOVA_POSHTA_API_KEY=your-nova-poshta-api-key
RESEND_API_KEY=your-resend-api-key

# Optional: Google Analytics
GA_MEASUREMENT_ID=your-ga-measurement-id
```

## Domain Configuration

1. **Custom Domain**: Add `antiblackout.shop` as a custom domain in Vercel
2. **DNS Settings**: Point your domain to Vercel's nameservers
3. **SSL Certificate**: Vercel will automatically provision SSL

## Redirects

The project now includes automatic redirects from the old Vercel domain (`anti-blackout.vercel.app`) to the new domain (`antiblackout.shop`).

## SEO Updates

All SEO configurations have been updated to use the new domain:

- Open Graph URLs
- Canonical URLs
- Sitemap URLs
- Robots.txt
- Structured data

## Testing

After deployment, test:

1. Visit `https://antiblackout.shop` - should load correctly
2. Visit `https://anti-blackout.vercel.app` - should redirect to new domain
3. Check sitemap at `https://antiblackout.shop/sitemap.xml`
4. Verify robots.txt at `https://antiblackout.shop/robots.txt`
