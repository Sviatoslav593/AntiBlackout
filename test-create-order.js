// Test script to check if create-order-after-payment works
const testCreateOrder = async () => {
  try {
    console.log("🧪 Testing create-order-after-payment...");

    const testData = {
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
    };

    const response = await fetch(
      "http://localhost:3000/api/create-order-after-payment",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testData),
      }
    );

    const result = await response.json();

    if (result.success) {
      console.log("✅ Create order test successful:", result);
    } else {
      console.error("❌ Create order test failed:", result);
    }
  } catch (error) {
    console.error("❌ Create order test error:", error);
  }
};

// Run the test
testCreateOrder();
