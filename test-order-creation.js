const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gtizpymstxfjyidhzygd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0aXpweW1zdHhmanlpZGh6eWdkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzA5MzU5NCwiZXhwIjoyMDcyNjY5NTk0fQ.Jib_mVTHCt3PYnBrl63_V89aEsK20akEIcJFDr7Gopk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testOrderCreation() {
  console.log('🧪 Testing order creation with product validation...');
  
  try {
    // Test data
    const orderData = {
      customerData: {
        name: "Test Customer",
        firstName: "Test",
        lastName: "Customer",
        phone: "+380000000000",
        email: "test@example.com",
        paymentMethod: "cod",
        city: "Київ",
        branch: "Відділення №1",
      },
      items: [
        {
          id: 1, // This should map to a valid UUID
          name: "PowerMax 20000мАг Швидка Зарядка",
          price: 2999,
          quantity: 1,
        },
        {
          id: 2, // This should map to a valid UUID
          name: "UltraSlim 10000мАг Бездротовий",
          price: 1899,
          quantity: 2,
        }
      ],
      totalAmount: 6797,
    };
    
    console.log('📝 Sending order creation request...');
    console.log('Items:', orderData.items.map(item => `ID ${item.id}: ${item.name}`));
    
    const response = await fetch('http://localhost:3000/api/order/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Order created successfully!');
      console.log('Order ID:', result.orderId);
      console.log('Status:', result.status);
      console.log('Payment Method:', result.paymentMethod);
      
      // Check if order items were created
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', result.orderId);
      
      if (itemsError) {
        console.error('❌ Error fetching order items:', itemsError);
      } else {
        console.log(`📦 Order items created: ${orderItems.length}`);
        orderItems.forEach((item, index) => {
          console.log(`${index + 1}. Product ID: ${item.product_id}, Name: ${item.product_name}, Quantity: ${item.quantity}`);
        });
      }
      
    } else {
      console.error('❌ Order creation failed:');
      console.error('Status:', response.status);
      console.error('Error:', result.error);
      console.error('Details:', result.details);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testOrderCreation();