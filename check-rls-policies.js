const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gtizpymstxfjyidhzygd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0aXpweW1zdHhmanlpZGh6eWdkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzA5MzU5NCwiZXhwIjoyMDcyNjY5NTk0fQ.Jib_mVTHCt3PYnBrl63_V89aEsK20akEIcJFDr7Gopk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRLSPolicies() {
  console.log('🔍 Checking RLS policies for products table...');
  
  try {
    // Check if RLS is enabled for products table
    const { data: tableInfo, error: tableError } = await supabase
      .from('pg_tables')
      .select('*')
      .eq('tablename', 'products')
      .single();
    
    if (tableError) {
      console.error('❌ Error checking table info:', tableError);
    } else {
      console.log('📋 Products table found:', tableInfo);
    }
    
    // Test basic product access
    console.log('\n🧪 Testing basic product access...');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, image_url')
      .limit(3);
    
    if (productsError) {
      console.error('❌ Error accessing products:', productsError);
    } else {
      console.log(`✅ Successfully accessed ${products.length} products:`);
      products.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name} - Image: ${product.image_url ? 'Has image' : 'No image'}`);
      });
    }
    
    // Test JOIN with order_items
    console.log('\n🔗 Testing JOIN with order_items...');
    const { data: joinTest, error: joinError } = await supabase
      .from('order_items')
      .select(`
        id, 
        product_name,
        products:product_id (
          image_url,
          name
        )
      `)
      .limit(3);
    
    if (joinError) {
      console.error('❌ Error testing JOIN:', joinError);
    } else {
      console.log(`✅ Successfully tested JOIN with ${joinTest.length} order_items:`);
      joinTest.forEach((item, index) => {
        console.log(`${index + 1}. ${item.product_name} - Product image: ${item.products?.image_url ? 'Found' : 'Not found'}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkRLSPolicies();
