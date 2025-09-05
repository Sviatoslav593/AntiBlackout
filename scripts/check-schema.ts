import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

import { supabase } from "../src/lib/supabase";

// Script to check database schema
async function checkSchema() {
  console.log("🔍 Checking Supabase database schema...");

  try {
    // Try to insert a simple product to see what columns exist
    const testProduct = {
      name: "Test Product",
      description: "Test Description",
      price: 100,
      stock: 1,
      image_url: "https://example.com/image.jpg",
    };

    console.log("📝 Attempting to insert test product...");
    const { data, error } = await supabase
      .from("products")
      .insert([testProduct])
      .select();

    if (error) {
      console.log("❌ Error details:", error);
      console.log("📋 This tells us about the table structure");
    } else {
      console.log("✅ Test product inserted successfully:", data);

      // Clean up test product
      await supabase.from("products").delete().eq("name", "Test Product");
      console.log("🧹 Test product cleaned up");
    }

    // Try to get table info
    console.log("\n🔍 Trying to get table information...");
    const { data: tableInfo, error: tableError } = await supabase
      .from("information_schema.columns")
      .select("column_name, data_type")
      .eq("table_name", "products");

    if (tableError) {
      console.log("❌ Could not get table info:", tableError);
    } else {
      console.log("📊 Table columns:", tableInfo);
    }
  } catch (error) {
    console.error("❌ Error checking schema:", error);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  checkSchema();
}

export { checkSchema };
