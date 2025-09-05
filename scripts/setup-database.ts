import dotenv from "dotenv";
import path from "path";
import fs from "fs";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

import { supabase } from "../src/lib/supabase";

// Script to set up database tables
async function setupDatabase() {
  console.log("🚀 Setting up Supabase database...");

  try {
    // Read SQL schema file
    const schemaPath = path.resolve(__dirname, "../supabase-schema.sql");
    const schemaSQL = fs.readFileSync(schemaPath, "utf8");

    // Split SQL into individual statements
    const statements = schemaSQL
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0 && !stmt.startsWith("--"));

    console.log(`📝 Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);
        
        const { error } = await supabase.rpc("exec_sql", { sql: statement });
        
        if (error) {
          console.error(`❌ Error executing statement ${i + 1}:`, error);
          console.log("Statement:", statement);
          // Continue with other statements
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
        }
      }
    }

    console.log("🎉 Database setup completed!");

    // Test the setup
    console.log("🧪 Testing database setup...");
    
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("count")
      .limit(1);

    if (productsError) {
      console.error("❌ Products table test failed:", productsError);
    } else {
      console.log("✅ Products table is accessible");
    }

    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("count")
      .limit(1);

    if (ordersError) {
      console.error("❌ Orders table test failed:", ordersError);
    } else {
      console.log("✅ Orders table is accessible");
    }

    console.log("🎉 Database setup and testing completed successfully!");

  } catch (error) {
    console.error("❌ Database setup failed:", error);
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  setupDatabase();
}

export { setupDatabase };
