import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateOrdersSchema() {
  try {
    console.log("🔄 Updating orders table schema for LiqPay integration...");

    // Add payment-related columns to orders table
    const { error: statusError } = await supabase.rpc("exec_sql", {
      sql: `
        -- Add payment status column
        ALTER TABLE orders 
        ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pending';
        
        -- Add payment ID column
        ALTER TABLE orders 
        ADD COLUMN IF NOT EXISTS payment_id VARCHAR(255);
        
        -- Add payment method column (if not exists)
        ALTER TABLE orders 
        ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'cash_on_delivery';
        
        -- Add index for payment status
        CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
        
        -- Add index for payment ID
        CREATE INDEX IF NOT EXISTS idx_orders_payment_id ON orders(payment_id);
        
        -- Update existing orders to have default payment status
        UPDATE orders 
        SET payment_status = 'pending' 
        WHERE payment_status IS NULL;
      `,
    });

    if (statusError) {
      console.error("❌ Error updating orders schema:", statusError);
      throw statusError;
    }

    console.log("✅ Orders table schema updated successfully!");
    console.log("📋 Added columns:");
    console.log("  - payment_status (VARCHAR) - LiqPay payment status");
    console.log("  - payment_id (VARCHAR) - LiqPay payment/transaction ID");
    console.log("  - payment_method (VARCHAR) - Payment method used");
    console.log("📊 Added indexes for better performance");

    // Verify the schema
    const { data: columns, error: columnsError } = await supabase
      .from("information_schema.columns")
      .select("column_name, data_type, column_default")
      .eq("table_name", "orders")
      .eq("table_schema", "public")
      .in("column_name", ["payment_status", "payment_id", "payment_method"]);

    if (columnsError) {
      console.error("❌ Error verifying schema:", columnsError);
    } else {
      console.log("🔍 Schema verification:");
      columns?.forEach((col) => {
        console.log(`  - ${col.column_name}: ${col.data_type} (default: ${col.column_default})`);
      });
    }

  } catch (error) {
    console.error("❌ Failed to update orders schema:", error);
    process.exit(1);
  }
}

// Run the update
updateOrdersSchema();
