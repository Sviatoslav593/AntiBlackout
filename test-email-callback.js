// Test script to check if email callback works
const testEmailCallback = async () => {
  try {
    console.log("🧪 Testing email callback...");

    // Test order data
    const testOrderData = {
      customer_name: "Test Customer",
      customer_email: "test@example.com",
      customer_phone: "+380000000000",
      city: "Київ",
      branch: "Відділення №1",
      payment_method: "online",
      total_amount: 1000,
      items: [
        {
          product_name: "Test Product",
          quantity: 1,
          price: 1000,
        },
      ],
      status: "paid",
      payment_status: "success",
      payment_id: "test-payment-123",
    };

    // Create order directly
    console.log("🔄 Creating test order...");
    const orderResponse = await fetch(
      "http://localhost:3000/api/create-order-after-payment",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerData: {
            name: "Test Customer",
            firstName: "Test",
            lastName: "Customer",
            phone: "+380000000000",
            email: "test@example.com",
            address: "Test Address",
            paymentMethod: "online",
            city: "Київ",
            warehouse: "Відділення №1",
          },
          items: [
            {
              id: 1,
              name: "Test Product",
              price: 1000,
              quantity: 1,
              image: "test.jpg",
            },
          ],
          total: 1000,
          orderId: "AB-test-" + Date.now(),
        }),
      }
    );

    const orderResult = await orderResponse.json();
    console.log("Order creation result:", orderResult);

    if (orderResult.success) {
      console.log("✅ Email callback test successful!");
    } else {
      console.log("❌ Email callback test failed!");
    }
  } catch (error) {
    console.error("❌ Email callback test error:", error);
  }
};

// Run the test
testEmailCallback();
