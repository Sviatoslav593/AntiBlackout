// Test script to simulate the complete payment flow
const testPaymentFlow = async () => {
  try {
    console.log("🧪 Testing complete payment flow...");
    
    // Step 1: Simulate payment preparation
    console.log("1️⃣ Simulating payment preparation...");
    const orderId = "AB-test-" + Date.now();
    
    // Step 2: Check if order exists (should be false initially)
    console.log("2️⃣ Checking if order exists (should be false)...");
    const statusResponse = await fetch(`http://localhost:3000/api/check-payment-status?orderId=${orderId}`);
    const statusResult = await statusResponse.json();
    console.log("Status check result:", statusResult);
    
    // Step 3: Simulate LiqPay callback (payment success)
    console.log("3️⃣ Simulating LiqPay callback...");
    const callbackData = {
      data: Buffer.from(JSON.stringify({
        order_id: orderId,
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

    const callbackResponse = await fetch("http://localhost:3000/api/payment-callback", {
      method: "POST",
      body: formData,
    });

    const callbackResult = await callbackResponse.json();
    console.log("Callback result:", callbackResult);
    
    // Step 4: Check if order exists now (should be true)
    console.log("4️⃣ Checking if order exists after callback...");
    const statusResponse2 = await fetch(`http://localhost:3000/api/check-payment-status?orderId=${orderId}`);
    const statusResult2 = await statusResponse2.json();
    console.log("Status check result after callback:", statusResult2);
    
    if (statusResult2.success && statusResult2.exists) {
      console.log("✅ Payment flow test successful!");
    } else {
      console.log("❌ Payment flow test failed!");
    }
    
  } catch (error) {
    console.error("❌ Payment flow test error:", error);
  }
};

// Run the test
testPaymentFlow();
