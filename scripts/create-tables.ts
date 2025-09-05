import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

import { supabase } from "../src/lib/supabase";

// Script to create tables using Supabase REST API
async function createTables() {
  console.log("🚀 Creating Supabase tables...");

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

    // Since we can't create tables via REST API, we'll provide instructions
    console.log("\n📋 MANUAL SETUP REQUIRED:");
    console.log("1. Go to your Supabase project dashboard");
    console.log("2. Navigate to SQL Editor");
    console.log("3. Copy and paste the following SQL:");
    console.log("\n" + "=".repeat(60));
    
    const schemaSQL = `
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
`;

    console.log(schemaSQL);
    console.log("=".repeat(60));
    console.log("\n4. Click 'Run' to execute the SQL");
    console.log("5. After creating tables, run: npm run test:supabase");
    console.log("6. Then run: npm run migrate");

  } catch (error) {
    console.error("❌ Error:", error);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  createTables();
}

export { createTables };
