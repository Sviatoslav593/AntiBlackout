# 🚀 Supabase Setup Instructions

## ✅ Current Status
- ✅ Supabase project created
- ✅ Environment variables configured
- ✅ Connection tested successfully
- ⏳ **Next Step**: Create database tables

## 📋 Manual Setup Required

### Step 1: Create Database Tables

1. **Go to your Supabase project dashboard:**
   - Open: https://supabase.com/dashboard
   - Select your project: `gtizpymstxfjyidhzygd`

2. **Navigate to SQL Editor:**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Copy and paste the following SQL:**

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Products table
create table if not exists products (
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

-- Orders table
create table if not exists orders (
    id uuid primary key default gen_random_uuid(),
    customer_name text not null,
    customer_email text,
    customer_phone text,
    city text not null,
    branch text not null,
    payment_method text not null,
    total_amount numeric not null,
    status text default 'pending' check (status in ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
    created_at timestamp with time zone default now()
);

-- Order items table
create table if not exists order_items (
    id uuid primary key default gen_random_uuid(),
    order_id uuid references orders(id) on delete cascade,
    product_id uuid references products(id),
    quantity int not null,
    price numeric not null,
    created_at timestamp with time zone default now()
);

-- Indexes for better performance
create index if not exists idx_products_name on products(name);
create index if not exists idx_products_brand on products(brand);
create index if not exists idx_orders_customer_name on orders(customer_name);
create index if not exists idx_orders_status on orders(status);
create index if not exists idx_orders_created_at on orders(created_at);
create index if not exists idx_order_items_order_id on order_items(order_id);
create index if not exists idx_order_items_product_id on order_items(product_id);

-- Row Level Security (RLS) policies
alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- Allow public read access to products
create policy "Products are viewable by everyone" on products
    for select using (true);

-- Allow public insert access to orders and order_items
create policy "Anyone can create orders" on orders
    for insert with check (true);

create policy "Anyone can create order items" on order_items
    for insert with check (true);

-- Allow public read access to orders (for order confirmation)
create policy "Orders are viewable by everyone" on orders
    for select using (true);

create policy "Order items are viewable by everyone" on order_items
    for select using (true);
```

4. **Execute the SQL:**
   - Click "Run" button
   - Wait for execution to complete
   - You should see "Success. No rows returned" message

### Step 2: Test Database Connection

After creating tables, test the connection:

```bash
npm run test:supabase
```

Expected output:
```
🧪 Testing Supabase connection...
✅ Database connected successfully!
✅ Products table accessible. Found 0 products.
✅ Orders table accessible. Found 0 orders.
🎉 Supabase integration test completed successfully!
```

### Step 3: Migrate Products Data

Migrate existing products from JSON to Supabase:

```bash
npm run migrate
```

Expected output:
```
🚀 Starting products migration to Supabase...
✅ Migrated product: PowerMax 20000мАг Швидка Зарядка
✅ Migrated product: Кабель USB-C 2m
... (more products)
🎉 All products migrated successfully!
```

### Step 4: Start Development Server

Start the development server to test the full integration:

```bash
npm run dev
```

## 🔧 Available Scripts

- `npm run test:supabase` - Test Supabase connection
- `npm run migrate` - Migrate products from JSON to Supabase
- `npm run create:tables` - Show SQL for creating tables
- `npm run dev` - Start development server

## 🧪 Testing the Integration

### 1. Test Products API
```bash
curl http://localhost:3000/api/products
```

### 2. Test Orders API
```bash
curl http://localhost:3000/api/orders
```

### 3. Test Order Creation
1. Add products to cart
2. Go to checkout page
3. Fill out the form
4. Submit order
5. Check Supabase dashboard for new order

## 📊 Supabase Dashboard

After setup, you can monitor your data in the Supabase dashboard:

1. **Table Editor**: View and edit data in tables
2. **SQL Editor**: Run custom queries
3. **API**: View auto-generated API documentation
4. **Logs**: Monitor database activity

## 🆘 Troubleshooting

### If `npm run test:supabase` fails:
- Check that tables were created successfully
- Verify environment variables in `.env.local`
- Check Supabase project is active

### If `npm run migrate` fails:
- Ensure products table exists
- Check for duplicate product names
- Verify product data format

### If API endpoints fail:
- Check Supabase RLS policies
- Verify table permissions
- Check network connectivity

## ✅ Success Indicators

You'll know everything is working when:

1. ✅ `npm run test:supabase` shows all green checkmarks
2. ✅ `npm run migrate` successfully migrates all products
3. ✅ `npm run dev` starts without errors
4. ✅ Products load on the website
5. ✅ Orders can be created and saved to Supabase
6. ✅ Order confirmation page shows real data

## 🎉 Next Steps

Once setup is complete:

1. **Customize products**: Add/edit products via Supabase dashboard
2. **Monitor orders**: View orders in real-time
3. **Deploy**: Deploy to Vercel with environment variables
4. **Scale**: Add more features like user authentication

---

**Need help?** Check the main `SUPABASE_INTEGRATION_README.md` for detailed documentation.
