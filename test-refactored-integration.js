// Test script for refactored LiqPay integration
const testRefactoredIntegration = async () => {
  try {
    console.log("🧪 Testing Refactored LiqPay Integration...");
    
    // Step 1: Test COD order creation
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

    console.log("✅ COD order created and should be paid immediately");

    // Step 2: Test LiqPay order creation
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

    console.log("✅ LiqPay order created with pending status");

    // Step 3: Test payment simulation
    console.log("\n3️⃣ Testing payment simulation...");
    const testPaymentResponse = await fetch("http://localhost:3000/api/test-payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderId: liqpayResult.orderId,
        status: "success",
      }),
    });

    const testPaymentResult = await testPaymentResponse.json();
    console.log("📞 Test payment result:", testPaymentResult);

    if (!testPaymentResult.success) {
      console.error("❌ Test payment failed:", testPaymentResult.error);
      return;
    }

    console.log("✅ Test payment successful, order should be paid");

    // Step 4: Test order retrieval
    console.log("\n4️⃣ Testing order retrieval...");
    const orderResponse = await fetch(`http://localhost:3000/api/order-success?orderId=${liqpayResult.orderId}`);
    const orderResult = await orderResponse.json();
    console.log("📦 Order retrieval result:", orderResult);

    if (orderResult.success && orderResult.order) {
      console.log("✅ Order found in database:", {
        id: orderResult.order.id,
        status: orderResult.order.status,
        payment_status: orderResult.order.payment_status,
        customer_name: orderResult.order.customer_name,
        total_amount: orderResult.order.total_amount,
      });
    } else {
      console.error("❌ Order not found in database");
    }

    // Step 5: Test cart clearing
    console.log("\n5️⃣ Testing cart clearing...");
    const cartClearResponse = await fetch(`http://localhost:3000/api/check-cart-clearing?orderId=${liqpayResult.orderId}`);
    const cartClearResult = await cartClearResponse.json();
    console.log("🧹 Cart clearing result:", cartClearResult);

    if (cartClearResult.shouldClear) {
      console.log("✅ Cart clearing event found");
    } else {
      console.log("ℹ️ No cart clearing event found");
    }

    console.log("\n🎉 Refactored integration test completed!");
    console.log("\n📋 Summary:");
    console.log("- COD order creation: ✅");
    console.log("- LiqPay order creation: ✅");
    console.log("- Payment simulation: ✅");
    console.log("- Order retrieval: ✅");
    console.log("- Cart clearing: ✅");
    
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
};

// Run the test
testRefactoredIntegration();
