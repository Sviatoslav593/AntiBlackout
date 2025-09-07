const { createClient } = require('@supabase/supabase-js');
const productsData = require('./src/data/products.json');

const supabaseUrl = 'https://gtizpymstxfjyidhzygd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0aXpweW1zdHhmanlpZGh6eWdkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzA5MzU5NCwiZXhwIjoyMDcyNjY5NTk0fQ.Jib_mVTHCt3PYnBrl63_V89aEsK20akEIcJFDr7Gopk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createProducts() {
  console.log('🚀 Creating products in database...');
  
  try {
    // First, check if products already exist
    const { data: existingProducts, error: checkError } = await supabase
      .from('products')
      .select('id, name')
      .limit(1);
    
    if (checkError) {
      console.error('❌ Error checking existing products:', checkError);
      return;
    }
    
    if (existingProducts && existingProducts.length > 0) {
      console.log('⚠️ Products already exist in database!');
      console.log('📦 Existing products:');
      existingProducts.forEach(product => {
        console.log(`  - ${product.name} (ID: ${product.id})`);
      });
      return;
    }
    
    // Create products from JSON data
    const productsToInsert = productsData.map(product => ({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.inStock ? 100 : 0, // Set stock based on inStock
      image_url: product.image,
      brand: product.brand,
      capacity: product.capacity ? product.capacity.toString() : null,
    }));
    
    console.log(`📝 Inserting ${productsToInsert.length} products...`);
    
    const { data: insertedProducts, error: insertError } = await supabase
      .from('products')
      .insert(productsToInsert)
      .select('id, name, price');
    
    if (insertError) {
      console.error('❌ Error inserting products:', insertError);
      return;
    }
    
    console.log(`✅ Successfully created ${insertedProducts.length} products:`);
    insertedProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} - ID: ${product.id} - Price: ${product.price}`);
    });
    
    // Create a mapping file for reference
    const mapping = productsData.map((originalProduct, index) => ({
      originalId: originalProduct.id,
      databaseId: insertedProducts[index].id,
      name: originalProduct.name
    }));
    
    console.log('\n📋 Product ID mapping:');
    mapping.forEach(item => {
      console.log(`Original ID ${item.originalId} → Database ID ${item.databaseId} (${item.name})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createProducts();
