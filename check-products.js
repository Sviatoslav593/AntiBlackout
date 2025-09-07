const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gtizpymstxfjyidhzygd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0aXpweW1zdHhmanlpZGh6eWdkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzA5MzU5NCwiZXhwIjoyMDcyNjY5NTk0fQ.Jib_mVTHCt3PYnBrl63_V89aEsK20akEIcJFDr7Gopk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProducts() {
  console.log('🔍 Checking products in database...');
  
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, price')
      .limit(10);
    
    if (error) {
      console.error('❌ Error fetching products:', error);
      return;
    }
    
    console.log(`📦 Found ${products.length} products:`);
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} - ID: ${product.id} - Price: ${product.price}`);
    });
    
    if (products.length === 0) {
      console.log('⚠️ No products found in database!');
      console.log('💡 Need to create products first.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkProducts();
