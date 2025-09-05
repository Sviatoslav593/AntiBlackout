import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

import { supabase } from "../src/lib/supabase";

// Test Supabase connection and basic operations
async function testSupabase() {
  console.log("🧪 Testing Supabase connection...");

  try {
    // Test connection
    const { data, error } = await supabase
      .from("products")
      .select("count")
      .limit(1);

    if (error) {
      console.error("❌ Database connection failed:", error);
      return;
    }

    console.log("✅ Database connected successfully!");

    // Test products table
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("*")
      .limit(5);

    if (productsError) {
      console.error("❌ Products query failed:", productsError);
    } else {
      console.log(
        `✅ Products table accessible. Found ${products?.length || 0} products.`
      );
    }

    // Test orders table
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("*")
      .limit(5);

    if (ordersError) {
      console.error("❌ Orders query failed:", ordersError);
    } else {
      console.log(
        `✅ Orders table accessible. Found ${orders?.length || 0} orders.`
      );
    }

    console.log("🎉 Supabase integration test completed successfully!");
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testSupabase();
}

export { testSupabase };
