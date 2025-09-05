import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

import { supabase } from "../src/lib/supabase";

// Script to fix RLS policies for products table
async function fixRLSPolicies() {
  console.log("🔧 Fixing RLS policies for products table...");

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

    // Since we can't modify RLS policies via REST API directly,
    // we'll provide the SQL to fix the policies
    console.log("\n📝 SQL to fix RLS policies:");
    console.log("=".repeat(60));

    const sql = `
-- Drop existing policies
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;
DROP POLICY IF EXISTS "Anyone can create order items" ON order_items;
DROP POLICY IF EXISTS "Orders are viewable by everyone" ON orders;
DROP POLICY IF EXISTS "Order items are viewable by everyone" ON order_items;

-- Create new policies that allow all operations
CREATE POLICY "Allow all operations on products" ON products
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on orders" ON orders
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on order_items" ON order_items
    FOR ALL USING (true) WITH CHECK (true);
`;

    console.log(sql);
    console.log("=".repeat(60));

    console.log("\n📋 INSTRUCTIONS:");
    console.log("1. Go to https://supabase.com/dashboard");
    console.log("2. Select your project: gtizpymstxfjyidhzygd");
    console.log("3. Go to SQL Editor");
    console.log("4. Copy and paste the SQL above");
    console.log("5. Click 'Run' to execute");
    console.log("6. After fixing policies, run: npm run migrate");
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  fixRLSPolicies();
}

export { fixRLSPolicies };
