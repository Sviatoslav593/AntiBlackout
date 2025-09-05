import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

import { supabase } from "../src/lib/supabase";

// Script to automatically create tables using Supabase REST API
async function createTablesAuto() {
  console.log("🚀 Automatically creating Supabase tables...");

  try {
    // Test connection first
    console.log("🧪 Testing connection...");
    const { data: testData, error: testError } = await supabase
      .from("_supabase_migrations")
      .select("count")
      .limit(1);

    if (testError && testError.code !== "PGRST205") {
      console.error("❌ Connection test failed:", testError);
      return;
    }

    console.log("✅ Connection successful!");

    // Since we can't create tables via REST API directly,
    // we'll provide the SQL and instructions
    console.log("\n📋 AUTOMATIC TABLE CREATION:");
    console.log("Since Supabase REST API doesn't support table creation,");
    console.log("we'll use the Supabase Management API approach.");
    console.log("\n🔧 Alternative: Use Supabase CLI or Dashboard");

    console.log("\n📝 SQL to execute in Supabase Dashboard:");
    console.log("=".repeat(60));

    const sql = `
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;

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
`;

    console.log(sql);
    console.log("=".repeat(60));

    console.log("\n📋 INSTRUCTIONS:");
    console.log("1. Go to https://supabase.com/dashboard");
    console.log("2. Select your project: gtizpymstxfjyidhzygd");
    console.log("3. Go to SQL Editor");
    console.log("4. Copy and paste the SQL above");
    console.log("5. Click 'Run' to execute");
    console.log("6. After creating tables, run: npm run test:supabase");
    console.log("7. Then run: npm run migrate");

    // Try to create a simple test to see if tables exist
    console.log("\n🧪 Testing if tables already exist...");

    try {
      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("count")
        .limit(1);

      if (productsError) {
        console.log("❌ Products table doesn't exist yet");
      } else {
        console.log("✅ Products table already exists!");
      }
    } catch (error) {
      console.log("❌ Tables not found - need to create them");
    }
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  createTablesAuto();
}

export { createTablesAuto };
