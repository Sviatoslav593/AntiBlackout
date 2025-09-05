import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

import { supabase } from "../src/lib/supabase";

// Script to disable RLS temporarily for testing
async function disableRLS() {
  console.log("🔧 Disabling RLS for testing...");

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

    // Since we can't modify RLS via REST API directly,
    // we'll provide the SQL to disable RLS
    console.log("\n📝 SQL to disable RLS:");
    console.log("=".repeat(60));

    const sql = `
-- Disable RLS temporarily for testing
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
`;

    console.log(sql);
    console.log("=".repeat(60));

    console.log("\n📋 INSTRUCTIONS:");
    console.log("1. Go to https://supabase.com/dashboard");
    console.log("2. Select your project: gtizpymstxfjyidhzygd");
    console.log("3. Go to SQL Editor");
    console.log("4. Copy and paste the SQL above");
    console.log("5. Click 'Run' to execute");
    console.log("6. After disabling RLS, run: npm run migrate");
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  disableRLS();
}

export { disableRLS };
