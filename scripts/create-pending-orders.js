const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

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
    // First, let's check if the table already exists
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'pending_orders');

    if (tablesError) {
      console.log("Could not check existing tables, proceeding with creation...");
    } else if (tables && tables.length > 0) {
      console.log("✅ 'pending_orders' table already exists.");
      return;
    }

    // Create the table using raw SQL
    const { error: createError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS pending_orders (
          id TEXT PRIMARY KEY,
          customer_data JSONB NOT NULL,
          items JSONB NOT NULL,
          amount NUMERIC(10, 2) NOT NULL,
          description TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (createError) {
      console.error("❌ Error creating table with exec:", createError);
      
      // Try alternative approach - create a simple table first
      console.log("Trying alternative approach...");
      
      // We'll create a simple test to see if we can insert data
      const testData = {
        id: 'test-' + Date.now(),
        customer_data: { name: 'Test Customer' },
        items: [{ name: 'Test Item', price: 100 }],
        amount: 100,
        description: 'Test order'
      };

      const { error: insertError } = await supabase
        .from('pending_orders')
        .insert(testData);

      if (insertError) {
        console.error("❌ Table does not exist and cannot be created:", insertError);
        console.log("\n📝 Please create the table manually in Supabase Dashboard:");
        console.log("1. Go to your Supabase project dashboard");
        console.log("2. Navigate to SQL Editor");
        console.log("3. Run the SQL from sql/create-pending-orders-table.sql");
        console.log("4. Or run this SQL:");
        console.log(`
CREATE TABLE pending_orders (
  id TEXT PRIMARY KEY,
  customer_data JSONB NOT NULL,
  items JSONB NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
        `);
        return;
      } else {
        console.log("✅ Table exists and is working!");
        // Clean up test data
        await supabase.from('pending_orders').delete().eq('id', testData.id);
      }
    } else {
      console.log("✅ 'pending_orders' table created successfully.");
    }

    console.log("🎉 Pending orders table setup completed!");
  } catch (error) {
    console.error("❌ Error creating pending_orders table:", error);
    console.log("\n📝 Please create the table manually in Supabase Dashboard:");
    console.log("1. Go to your Supabase project dashboard");
    console.log("2. Navigate to SQL Editor");
    console.log("3. Run the SQL from sql/create-pending-orders-table.sql");
  }
}

createPendingOrdersTable();
