const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gtizpymstxfjyidhzygd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0aXpweW1zdHhmanlpZGh6eWdkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzA5MzU5NCwiZXhwIjoyMDcyNjY5NTk0fQ.Jib_mVTHCt3PYnBrl63_V89aEsK20akEIcJFDr7Gopk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function addProductImageColumn() {
  console.log('🔧 Adding product_image column to order_items table...');
  
  try {
    // Add the column
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE order_items ADD COLUMN IF NOT EXISTS product_image TEXT;'
    });
    
    if (error) {
      console.error('❌ Error adding column:', error);
      return;
    }
    
    console.log('✅ Successfully added product_image column to order_items table');
    
    // Verify the column was added
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'order_items')
      .eq('column_name', 'product_image');
    
    if (columnsError) {
      console.error('❌ Error checking columns:', columnsError);
    } else if (columns && columns.length > 0) {
      console.log('✅ Column verified:', columns[0]);
    } else {
      console.log('⚠️ Column not found, but no error occurred');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

addProductImageColumn();
