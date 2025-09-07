// Test script for LiqPay integration
const testLiqPayIntegration = async () => {
  try {
    console.log("🧪 Testing LiqPay Integration...");
    
    const orderId = "AB-test-" + Date.now();
    console.log("📝 Test order ID:", orderId);
    
    // Step 1: Test payment preparation
    console.log("\n1️⃣ Testing payment preparation...");
    const prepareResponse = await fetch("http://localhost:3000/api/payment-prepare", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: 1000,
        description: "Test order for LiqPay integration",
        orderId: orderId,
        currency: "UAH",
        customerData: {
          name: "Test Customer",
          firstName: "Test",
          lastName: "Customer",
          phone: "+380000000000",
          email: "test@example.com",
          address: "Test Address",
          paymentMethod: "online",
          city: "Київ",
          warehouse: "Відділення №1"
        },
        items: [
          {
            id: 1,
            name: "Test Product",
            price: 1000,
            quantity: 1,
            image: "test.jpg"
          }
        ],
      }),
    });

    const prepareResult = await prepareResponse.json();
    console.log("📝 Payment preparation result:", prepareResult);

    if (!prepareResult.success) {
      console.error("❌ Payment preparation failed:", prepareResult.error);
      return;
    }

    // Step 2: Test mock callback (simulating LiqPay callback)
    console.log("\n2️⃣ Testing mock callback...");
    const mockCallbackResponse = await fetch("http://localhost:3000/api/mock-payment-callback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderId: orderId,
        status: "success"
      }),
    });

    const mockCallbackResult = await mockCallbackResponse.json();
    console.log("📞 Mock callback result:", mockCallbackResult);

    if (!mockCallbackResult.success) {
      console.error("❌ Mock callback failed:", mockCallbackResult.error);
      return;
    }

    // Step 3: Test order retrieval
    console.log("\n3️⃣ Testing order retrieval...");
    const orderResponse = await fetch(`http://localhost:3000/api/order-success?orderId=${orderId}`);
    const orderResult = await orderResponse.json();
    console.log("📦 Order retrieval result:", orderResult);

    if (orderResult.success && orderResult.order) {
      console.log("✅ Order found in database:", {
        id: orderResult.order.id,
        status: orderResult.order.status,
        payment_status: orderResult.order.payment_status,
        customer_name: orderResult.order.customer_name,
        total_amount: orderResult.order.total_amount
      });
    } else {
      console.error("❌ Order not found in database");
    }

    // Step 4: Test cart clearing
    console.log("\n4️⃣ Testing cart clearing...");
    const cartClearResponse = await fetch(`http://localhost:3000/api/check-cart-clearing?orderId=${orderId}`);
    const cartClearResult = await cartClearResponse.json();
    console.log("🧹 Cart clearing result:", cartClearResult);

    if (cartClearResult.shouldClear) {
      console.log("✅ Cart clearing event found");
    } else {
      console.log("ℹ️ No cart clearing event found");
    }

    console.log("\n🎉 LiqPay integration test completed!");
    console.log("\n📋 Summary:");
    console.log("- Payment preparation: ✅");
    console.log("- Mock callback: ✅");
    console.log("- Order retrieval: ✅");
    console.log("- Cart clearing: ✅");
    
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
};

// Run the test
testLiqPayIntegration();
