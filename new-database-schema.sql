-- ==========================================
-- NEW DATABASE SCHEMA FOR XML IMPORT
-- ==========================================
-- Execute this SQL in your Supabase SQL Editor

-- 1. Drop existing tables to recreate with new schema
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- CATEGORIES TABLE (Normalized)
-- ==========================================
CREATE TABLE categories (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert normalized categories
INSERT INTO categories (id, name) VALUES
(1001, 'Портативні батареї'),
(1002, 'Зарядки та кабелі');

-- ==========================================
-- PRODUCTS TABLE (Updated Schema)
-- ==========================================
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL,
    brand TEXT,
    image_url TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    vendor_code TEXT,
    quantity INTEGER DEFAULT 0,
    category_id INTEGER REFERENCES categories(id),
    characteristics JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- ORDERS TABLE (Unchanged)
-- ==========================================
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE NOT NULL DEFAULT 'ORD-' || EXTRACT(EPOCH FROM NOW())::TEXT,
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    customer_phone TEXT,
    city TEXT NOT NULL,
    branch TEXT NOT NULL,
    payment_method TEXT NOT NULL,
    total_amount NUMERIC NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- ORDER ITEMS TABLE (Unchanged)
-- ==========================================
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    product_name TEXT NOT NULL,
    product_price NUMERIC NOT NULL,
    quantity INTEGER NOT NULL,
    price NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- INDEXES FOR PERFORMANCE
-- ==========================================
CREATE INDEX idx_products_external_id ON products(external_id);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_quantity ON products(quantity);
CREATE INDEX idx_products_characteristics ON products USING GIN(characteristics);
CREATE INDEX idx_categories_name ON categories(name);
CREATE INDEX idx_orders_customer_name ON orders(customer_name);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- ==========================================
-- TRIGGERS FOR UPDATED_AT
-- ==========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Allow public read access to products and categories
CREATE POLICY "Products are viewable by everyone" ON products
    FOR SELECT USING (true);

CREATE POLICY "Categories are viewable by everyone" ON categories
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

-- ==========================================
-- VERIFICATION
-- ==========================================
-- Check table structures
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name IN ('products', 'categories', 'orders', 'order_items')
ORDER BY table_name, ordinal_position;

-- Check categories
SELECT * FROM categories;

-- Show table counts (should be 0 for products initially)
SELECT 
    'products' as table_name, COUNT(*) as row_count FROM products
UNION ALL
SELECT 
    'categories' as table_name, COUNT(*) as row_count FROM categories
UNION ALL
SELECT 
    'orders' as table_name, COUNT(*) as row_count FROM orders
UNION ALL
SELECT 
    'order_items' as table_name, COUNT(*) as row_count FROM order_items;
