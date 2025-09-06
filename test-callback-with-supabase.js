// Test LiqPay callback with Supabase pending order
const testCallbackWithSupabase = async () => {
  try {
    console.log("🧪 Testing LiqPay callback with Supabase...");

    const orderId = "AB-test-supabase-" + Date.now();
    console.log("📝 Creating test order data:", orderId);

    // First, create pending order in Supabase
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

    // Create pending order via payment-prepare API
    console.log("🔄 Creating pending order...");
    const prepareResponse = await fetch(
      "http://localhost:3000/api/payment-prepare",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: 1000,
          description: "Test order",
          orderId: orderId,
          currency: "UAH",
          customerData: testData.customerData,
          items: testData.items,
        }),
      }
    );

    const prepareResult = await prepareResponse.json();
    console.log("📝 Pending order created:", prepareResult);

    if (!prepareResult.success) {
      console.error("❌ Failed to create pending order:", prepareResult.error);
      return;
    }

    // Now simulate LiqPay callback
    console.log("📞 Simulating LiqPay callback...");
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

    const callbackResponse = await fetch(
      "http://localhost:3000/api/payment-callback",
      {
        method: "POST",
        body: formData,
      }
    );

    const callbackResult = await callbackResponse.json();
    console.log("📞 Callback response:", callbackResult);

    if (callbackResult.success) {
      console.log("✅ Callback test successful!");
    } else {
      console.log("❌ Callback test failed:", callbackResult.error);
    }
  } catch (error) {
    console.error("❌ Callback test error:", error);
  }
};

// Run the test
testCallbackWithSupabase();
