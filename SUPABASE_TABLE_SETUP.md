# 🗄️ Supabase Table Setup Instructions

## ✅ Current Status

- ✅ Supabase project: `tplfwnvrvobabuhqqviv.supabase.co`
- ✅ API key configured
- ✅ Connection working
- ⏳ **Tables need to be created with correct schema**

## 📋 Manual Table Creation Required

### Step 1: Go to Supabase Dashboard

1. Open: https://supabase.com/dashboard
2. Select your project: `tplfwnvrvobabuhqqviv`
3. Go to **SQL Editor**

### Step 2: Create Tables

Copy and paste this SQL:

```sql
-- Drop existing tables if they exist
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    image_url TEXT,
    brand TEXT,
    capacity TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    customer_phone TEXT,
    city TEXT NOT NULL,
    branch TEXT NOT NULL,
    payment_method TEXT NOT NULL,
    total_amount NUMERIC NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    quantity INTEGER NOT NULL,
    price NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_orders_customer_name ON orders(customer_name);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- Row Level Security (RLS) policies
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Allow public read access to products
CREATE POLICY "Products are viewable by everyone" ON products
    FOR SELECT USING (true);

-- Allow public insert access to orders and order_items
CREATE POLICY "Anyone can create orders" ON orders
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can create order items" ON order_items
    FOR INSERT WITH CHECK (true);

-- Allow public read access to orders (for order confirmation)
CREATE POLICY "Orders are viewable by everyone" ON orders
    FOR SELECT USING (true);

CREATE POLICY "Order items are viewable by everyone" ON order_items
    FOR SELECT USING (true);
```

### Step 3: Execute SQL

1. Click **"Run"** button
2. Wait for execution to complete
3. You should see "Success" message

### Step 4: Test Connection

```bash
npm run test:supabase
```

**Expected output:**

```
🧪 Testing Supabase connection...
✅ Database connected successfully!
✅ Products table accessible. Found 0 products.
✅ Orders table accessible. Found 0 orders.
🎉 Supabase integration test completed successfully!
```

### Step 5: Migrate Products

```bash
npm run migrate
```

**Expected output:**

```
🚀 Starting products migration to Supabase...
✅ Migrated product: PowerMax 20000мАг Швидка Зарядка
✅ Migrated product: Кабель USB-C 2m
... (more products)
🎉 All products migrated successfully!
```

### Step 6: Start Development Server

```bash
npm run dev
```

## 🔧 Available Commands

- `npm run test:supabase` - Test database connection
- `npm run migrate` - Migrate products from JSON
- `npm run check:schema` - Check table structure
- `npm run dev` - Start development server

## ✅ Verification

You'll know everything is working when:

1. ✅ `npm run test:supabase` shows all green checkmarks
2. ✅ `npm run migrate` successfully migrates all products
3. ✅ `npm run dev` starts without errors
4. ✅ Products load on the website
5. ✅ Orders can be created and saved to Supabase

## 🆘 Troubleshooting

### If migration fails:

- Check that all tables were created successfully
- Verify table column names match the schema
- Check for any RLS policy issues

### If connection fails:

- Verify API key is correct
- Check Supabase project is active
- Ensure environment variables are loaded

---

**Status**: ⏳ Tables need to be created  
**Next Step**: Execute SQL in Supabase dashboard
