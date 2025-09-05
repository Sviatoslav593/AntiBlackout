import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

import { supabase } from "../src/lib/supabase";

// Script to check order_items table schema
async function checkOrderItemsSchema() {
  console.log("🔍 Checking order_items table schema...");

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

    // Try to insert a test order item to see what columns are available
    console.log("\n🧪 Testing order_items table structure...");

    try {
      const { data: testInsert, error: insertError } = await supabase
        .from("order_items")
        .insert([
          {
            order_id: "00000000-0000-0000-0000-000000000000", // Dummy UUID
            product_id: null,
            product_name: "Test Product",
            product_price: 100,
            quantity: 1,
            price: 100,
          },
        ])
        .select();

      if (insertError) {
        console.log(
          "❌ Insert test failed - this shows us the current schema:"
        );
        console.log("Error:", insertError);

        if (insertError.message.includes("product_name")) {
          console.log(
            "\n🔧 SOLUTION: The product_name column doesn't exist yet."
          );
          console.log("You need to execute the SQL in Supabase Dashboard:");
          console.log("=".repeat(60));
          console.log(`
-- Add new columns to order_items table
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS product_name TEXT,
ADD COLUMN IF NOT EXISTS product_price NUMERIC;

-- Update existing records
UPDATE order_items 
SET 
  product_name = 'Unknown Product',
  product_price = price
WHERE product_name IS NULL;

-- Make fields required for new records
ALTER TABLE order_items 
ALTER COLUMN product_name SET NOT NULL;
ALTER TABLE order_items 
ALTER COLUMN product_price SET NOT NULL;
`);
          console.log("=".repeat(60));
        }
      } else {
        console.log("✅ Insert test successful - schema is correct!");
        console.log("Test data:", testInsert);

        // Clean up test data
        await supabase
          .from("order_items")
          .delete()
          .eq("order_id", "00000000-0000-0000-0000-000000000000");
      }
    } catch (error) {
      console.log("❌ Schema test error:", error);
    }
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  checkOrderItemsSchema();
}

export { checkOrderItemsSchema };
