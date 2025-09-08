const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function checkImportLogs() {
  try {
    console.log('🔄 Checking import logs...');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Missing Supabase environment variables');
      console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
      console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? 'Set' : 'Missing');
      return;
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Перевіряємо, чи існує таблиця import_logs
    const { data: logs, error: logsError } = await supabase
      .from('import_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (logsError) {
      console.error('❌ Error checking import_logs:', logsError);
      console.log('Table might not exist. Creating it...');
      
      // Створюємо таблицю
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS import_logs (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            success BOOLEAN NOT NULL,
            imported INTEGER DEFAULT 0,
            updated INTEGER DEFAULT 0,
            errors INTEGER DEFAULT 0,
            total_processed INTEGER DEFAULT 0,
            error_message TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      });
      
      if (createError) {
        console.error('❌ Error creating import_logs table:', createError);
      } else {
        console.log('✅ import_logs table created');
      }
    } else {
      console.log(`📊 Found ${logs.length} import logs`);
      logs.forEach((log, index) => {
        console.log(`${index + 1}. ${log.success ? '✅' : '❌'} ${log.created_at} - Imported: ${log.imported}, Updated: ${log.updated}, Errors: ${log.errors}`);
        if (log.error_message) {
          console.log(`   Error: ${log.error_message}`);
        }
      });
    }
    
    // Перевіряємо товари
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, external_id, name, price, brand, category, quantity, image_url, created_at')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (productsError) {
      console.error('❌ Error checking products:', productsError);
    } else {
      console.log(`\n📦 Found ${products.length} products (showing last 10)`);
      products.forEach((product, index) => {
        console.log(`${index + 1}. ${product.external_id ? '🔄' : '📝'} ${product.name} - ${product.price} UAH`);
      });
    }
    
    // Перевіряємо загальну статистику
    const { data: stats, error: statsError } = await supabase
      .from('products')
      .select('external_id, price, quantity, image_url');
    
    if (!statsError && stats) {
      const total = stats.length;
      const withExternalId = stats.filter(p => p.external_id).length;
      const withPrice = stats.filter(p => p.price && p.price > 0).length;
      const inStock = stats.filter(p => p.quantity && p.quantity > 0).length;
      const withImages = stats.filter(p => p.image_url).length;
      
      console.log('\n📊 Product Statistics:');
      console.log(`Total: ${total}`);
      console.log(`With external_id: ${withExternalId}`);
      console.log(`With price: ${withPrice}`);
      console.log(`In stock: ${inStock}`);
      console.log(`With images: ${withImages}`);
    }
    
  } catch (error) {
    console.error('❌ Error checking import logs:', error);
  }
}

checkImportLogs();
