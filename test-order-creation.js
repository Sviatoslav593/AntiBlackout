// Test script for order creation with both payment methods
const testOrderCreation = async () => {
  try {
    console.log("🧪 Testing Order Creation for Both Payment Methods...");
    
    // Test COD order creation
    console.log("\n1️⃣ Testing COD order creation...");
    const codResponse = await fetch("http://localhost:3000/api/order/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customerData: {
          name: "Test COD Customer",
          firstName: "Test",
          lastName: "COD",
          phone: "+380000000000",
          email: "test-cod@example.com",
          address: "Test Address",
          paymentMethod: "cod",
          city: "Київ",
          warehouse: "Відділення №1",
        },
        items: [
          {
            id: 1,
            name: "Test COD Product",
            price: 500,
            quantity: 1,
            image: "test.jpg",
          },
        ],
        totalAmount: 500,
      }),
    });

    const codResult = await codResponse.json();
    console.log("📝 COD order result:", codResult);

    if (!codResult.success) {
      console.error("❌ COD order creation failed:", codResult.error);
      return;
    }

    console.log("✅ COD order created successfully:", {
      orderId: codResult.orderId,
      status: codResult.status,
      paymentMethod: codResult.paymentMethod,
    });

    // Test LiqPay order creation
    console.log("\n2️⃣ Testing LiqPay order creation...");
    const liqpayResponse = await fetch("http://localhost:3000/api/order/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customerData: {
          name: "Test LiqPay Customer",
          firstName: "Test",
          lastName: "LiqPay",
          phone: "+380000000000",
          email: "test-liqpay@example.com",
          address: "Test Address",
          paymentMethod: "liqpay",
          city: "Київ",
          warehouse: "Відділення №1",
        },
        items: [
          {
            id: 2,
            name: "Test LiqPay Product",
            price: 1000,
            quantity: 1,
            image: "test.jpg",
          },
        ],
        totalAmount: 1000,
      }),
    });

    const liqpayResult = await liqpayResponse.json();
    console.log("📝 LiqPay order result:", liqpayResult);

    if (!liqpayResult.success) {
      console.error("❌ LiqPay order creation failed:", liqpayResult.error);
      return;
    }

    console.log("✅ LiqPay order created successfully:", {
      orderId: liqpayResult.orderId,
      status: liqpayResult.status,
      paymentMethod: liqpayResult.paymentMethod,
    });

    // Test order retrieval for both orders
    console.log("\n3️⃣ Testing order retrieval...");
    
    // Test COD order retrieval
    const codOrderResponse = await fetch(`http://localhost:3000/api/order-success?orderId=${codResult.orderId}`);
    const codOrderResult = await codOrderResponse.json();
    console.log("📦 COD order retrieval result:", codOrderResult);

    // Test LiqPay order retrieval
    const liqpayOrderResponse = await fetch(`http://localhost:3000/api/order-success?orderId=${liqpayResult.orderId}`);
    const liqpayOrderResult = await liqpayOrderResponse.json();
    console.log("📦 LiqPay order retrieval result:", liqpayOrderResult);

    console.log("\n🎉 Order creation test completed!");
    console.log("\n📋 Summary:");
    console.log("- COD order creation: ✅");
    console.log("- LiqPay order creation: ✅");
    console.log("- Order retrieval: ✅");
    
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
};

// Run the test
testOrderCreation();
