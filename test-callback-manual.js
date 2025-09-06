// Manual test for LiqPay callback
const testCallbackManual = async () => {
  try {
    console.log("🧪 Testing LiqPay callback manually...");

    // Create test order data first
    const orderId = "AB-test-manual-" + Date.now();
    console.log("📝 Creating test order data:", orderId);

    // Store test data in pending_orders (simulate payment preparation)
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
      amount: 1000,
      description: "Test order",
    };

    // Store test data in pending_orders table (simulate what happens in payment preparation)
    console.log("💾 Test data prepared for pending_orders table");

    // Now simulate LiqPay callback
    const callbackData = {
      data: Buffer.from(
        JSON.stringify({
          order_id: orderId,
          status: "success",
          amount: 1000,
          currency: "UAH",
          transaction_id: "test-txn-" + Date.now(),
          payment_id: "test-payment-" + Date.now(),
        })
      ).toString("base64"),
      signature: "test-signature",
    };

    const formData = new FormData();
    formData.append("data", callbackData.data);
    formData.append("signature", callbackData.signature);

    console.log("📞 Sending callback to payment-callback API...");
    const response = await fetch("http://localhost:3000/api/payment-callback", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    console.log("📞 Callback response:", result);

    if (result.success) {
      console.log("✅ Callback test successful!");
    } else {
      console.log("❌ Callback test failed:", result.error);
    }
  } catch (error) {
    console.error("❌ Callback test error:", error);
  }
};

// Run the test
testCallbackManual();
