// Test script to simulate LiqPay callback
const testLiqPayCallback = async () => {
  try {
    console.log("🧪 Testing LiqPay callback...");
    
    // Simulate LiqPay callback data
    const callbackData = {
      data: Buffer.from(JSON.stringify({
        order_id: "AB-1234567890-test",
        status: "success",
        amount: 1000,
        currency: "UAH",
        transaction_id: "test-txn-123",
        payment_id: "test-payment-123"
      })).toString("base64"),
      signature: "test-signature"
    };

    const formData = new FormData();
    formData.append("data", callbackData.data);
    formData.append("signature", callbackData.signature);

    const response = await fetch("http://localhost:3000/api/payment-callback", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    
    if (result.success) {
      console.log("✅ LiqPay callback test successful:", result);
    } else {
      console.error("❌ LiqPay callback test failed:", result);
    }
  } catch (error) {
    console.error("❌ LiqPay callback test error:", error);
  }
};

// Run the test
testLiqPayCallback();
