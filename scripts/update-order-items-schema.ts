import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

import { supabase } from "../src/lib/supabase";

// Script to update order_items table schema
async function updateOrderItemsSchema() {
  console.log("🔧 Updating order_items table schema...");

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

    // Since we can't modify table schema via REST API directly,
    // we'll provide the SQL to update the schema
    console.log("\n📝 SQL to update order_items table schema:");
    console.log("=".repeat(60));

    const sql = `
-- Add new columns to order_items table
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS product_name TEXT,
ADD COLUMN IF NOT EXISTS product_price NUMERIC;

-- Update existing records to have product_name and product_price
-- (This will set them to NULL for existing records, which is fine)
UPDATE order_items 
SET 
  product_name = 'Unknown Product',
  product_price = price
WHERE product_name IS NULL;

-- Make product_name NOT NULL for new records
ALTER TABLE order_items 
ALTER COLUMN product_name SET NOT NULL;

-- Make product_price NOT NULL for new records  
ALTER TABLE order_items 
ALTER COLUMN product_price SET NOT NULL;
`;

    console.log(sql);
    console.log("=".repeat(60));

    console.log("\n📋 INSTRUCTIONS:");
    console.log("1. Go to https://supabase.com/dashboard");
    console.log("2. Select your project: gtizpymstxfjyidhzygd");
    console.log("3. Go to SQL Editor");
    console.log("4. Copy and paste the SQL above");
    console.log("5. Click 'Run' to execute");
    console.log("6. After updating schema, test with: npm run test:supabase");
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  updateOrderItemsSchema();
}

export { updateOrderItemsSchema };
