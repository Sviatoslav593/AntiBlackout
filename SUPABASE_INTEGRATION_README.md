# 🚀 Supabase Integration for E-commerce Website

## 📋 Overview

This project has been integrated with Supabase as the backend database. All product and order data is now stored in Supabase instead of local JSON files.

## 🛠️ Setup Instructions

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login and create a new project
3. Wait for the project to be ready (usually 2-3 minutes)

### 2. Get Supabase Credentials

1. Go to your project dashboard
2. Navigate to **Settings** → **API**
3. Copy the following values:
   - **Project URL** (e.g., `https://your-project-id.supabase.co`)
   - **Anon public key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

### 3. Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Example:**

```bash
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY5OTk5OTk5OSwiZXhwIjoyMDE1NTc1OTk5fQ.example
```

### 4. Create Database Tables

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase-schema.sql`
4. Click **Run** to execute the SQL

This will create:

- `products` table
- `orders` table
- `order_items` table
- Indexes for performance
- Row Level Security (RLS) policies

### 5. Migrate Existing Data

Run the migration script to move products from JSON to Supabase:

```bash
# Install ts-node for running TypeScript files
npm install -g ts-node

# Run the migration script
npx ts-node scripts/migrate-to-supabase.ts
```

## 📊 Database Schema

### Products Table

```sql
create table products (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    description text,
    price numeric not null,
    stock int not null default 0,
    image_url text,
    brand text,
    capacity text,
    created_at timestamp with time zone default now()
);
```

### Orders Table

```sql
create table orders (
    id uuid primary key default gen_random_uuid(),
    customer_name text not null,
    customer_email text,
    customer_phone text,
    city text not null,
    branch text not null,
    payment_method text not null,
    total_amount numeric not null,
    status text default 'pending',
    created_at timestamp with time zone default now()
);
```

### Order Items Table

```sql
create table order_items (
    id uuid primary key default gen_random_uuid(),
    order_id uuid references orders(id) on delete cascade,
    product_id uuid references products(id),
    quantity int not null,
    price numeric not null,
    created_at timestamp with time zone default now()
);
```

## 🔧 API Endpoints

### Products

- `GET /api/products` - Get all products
- `GET /api/products?search=query` - Search products
- `GET /api/products/[id]` - Get product by ID
- `POST /api/products` - Create new product
- `PUT /api/products/[id]` - Update product
- `DELETE /api/products/[id]` - Delete product

### Orders

- `GET /api/orders` - Get all orders
- `GET /api/orders?status=pending` - Get orders by status
- `GET /api/orders/[id]` - Get order by ID
- `PUT /api/orders/[id]` - Update order status
- `DELETE /api/orders/[id]` - Delete order

### Statistics

- `GET /api/stats` - Get order statistics

## 🏗️ Services

### ProductService

```typescript
import { ProductService } from "@/services/products";

// Get all products
const products = await ProductService.getAllProducts();

// Get product by ID
const product = await ProductService.getProductById(id);

// Create product
const newProduct = await ProductService.createProduct(productData);

// Update product
const updatedProduct = await ProductService.updateProduct(id, updates);

// Delete product
await ProductService.deleteProduct(id);

// Search products
const searchResults = await ProductService.searchProducts(query);
```

### OrderService

```typescript
import { OrderService } from "@/services/orders";

// Create order
const order = await OrderService.createOrder(orderData);

// Get order by ID
const order = await OrderService.getOrderById(id);

// Get all orders
const orders = await OrderService.getAllOrders();

// Update order status
const updatedOrder = await OrderService.updateOrderStatus(id, "confirmed");

// Get order statistics
const stats = await OrderService.getOrderStats();
```

## 🔒 Security

### Row Level Security (RLS)

- **Products**: Public read access, admin write access
- **Orders**: Public read/write access for order creation
- **Order Items**: Public read/write access for order creation

### Environment Variables

- Never commit `.env.local` to version control
- Use `.env.local.example` as a template
- Keep your Supabase keys secure

## 🚀 Deployment

### Vercel

1. Add environment variables in Vercel dashboard
2. Deploy as usual - Supabase will work automatically

### Other Platforms

1. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. Deploy your application
3. Supabase will handle the database automatically

## 🧪 Testing

### Test Database Connection

```typescript
import { supabase } from "@/lib/supabase";

// Test connection
const { data, error } = await supabase
  .from("products")
  .select("count")
  .limit(1);

if (error) {
  console.error("Database connection failed:", error);
} else {
  console.log("Database connected successfully!");
}
```

### Test API Endpoints

```bash
# Test products endpoint
curl http://localhost:3000/api/products

# Test orders endpoint
curl http://localhost:3000/api/orders

# Test stats endpoint
curl http://localhost:3000/api/stats
```

## 📈 Monitoring

### Supabase Dashboard

- Monitor database performance
- View real-time logs
- Check API usage
- Manage database backups

### Application Logs

- All database operations are logged
- Check console for error messages
- Monitor API response times

## 🔄 Migration from JSON

The project automatically migrates from JSON files to Supabase:

1. **Products**: Migrated via `migrate-to-supabase.ts` script
2. **Orders**: New orders are saved directly to Supabase
3. **Legacy Data**: Old JSON files are preserved for backup

## 🆘 Troubleshooting

### Common Issues

1. **Environment Variables Not Set**

   - Check `.env.local` file exists
   - Verify variable names are correct
   - Restart development server

2. **Database Connection Failed**

   - Check Supabase URL and key
   - Verify project is active
   - Check network connectivity

3. **RLS Policy Errors**

   - Check Row Level Security policies
   - Verify user permissions
   - Check table access rights

4. **Migration Errors**
   - Check product data format
   - Verify database schema
   - Check for duplicate entries

### Getting Help

1. Check Supabase documentation
2. Review error logs in console
3. Check Supabase dashboard for issues
4. Verify environment variables

## ✅ Benefits

- **Scalability**: Handle thousands of products and orders
- **Real-time**: Live updates across all clients
- **Security**: Built-in authentication and RLS
- **Performance**: Optimized queries and indexes
- **Backup**: Automatic database backups
- **Monitoring**: Built-in analytics and logs

---

**Status**: ✅ Fully Integrated  
**Database**: Supabase PostgreSQL  
**Authentication**: Row Level Security  
**API**: RESTful endpoints  
**Migration**: Complete
