import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    "Supabase environment variables are missing. Please check your .env.local file contains:\n" +
      "NEXT_PUBLIC_SUPABASE_URL=your-project-url\n" +
      "SUPABASE_SERVICE_ROLE_KEY=your-service-role-key"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createPendingOrdersTable() {
  console.log("Creating 'pending_orders' table...");

  try {
    // Create pending_orders table
    const { error: createError } = await supabase.rpc("execute_sql", {
      sql_query: `
        CREATE TABLE IF NOT EXISTS pending_orders (
          id TEXT PRIMARY KEY,
          customer_data JSONB NOT NULL,
          items JSONB NOT NULL,
          amount NUMERIC(10, 2) NOT NULL,
          description TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `,
    });

    if (createError) {
      throw createError;
    }

    console.log("✅ 'pending_orders' table created successfully.");

    // Create index for better performance
    const { error: indexError } = await supabase.rpc("execute_sql", {
      sql_query: `
        CREATE INDEX IF NOT EXISTS idx_pending_orders_created_at 
        ON pending_orders(created_at);
      `,
    });

    if (indexError) {
      console.warn("⚠️ Warning: Could not create index:", indexError);
    } else {
      console.log("✅ Index created successfully.");
    }

    console.log("🎉 Pending orders table setup completed!");
  } catch (error) {
    console.error("❌ Error creating pending_orders table:", error);
    process.exit(1);
  }
}

createPendingOrdersTable();
