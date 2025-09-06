// Test script for Supabase Edge Function
const testOrderData = {
  order: {
    id: "test-order-" + Date.now(),
    status: "pending",
    total_price: 2500,
    items: [
      {
        name: "PowerMax 20000мАг Швидка Зарядка",
        quantity: 2,
        price: 1200,
      },
      {
        name: "Кабель USB-C 2m",
        quantity: 1,
        price: 100,
      },
    ],
  },
  customer: {
    email: "test@example.com", // Change to your email for testing
    name: "Тест Тестович",
  },
};

async function testEmailFunction() {
  try {
    console.log("🧪 Testing Supabase Edge Function...");
    console.log("Order data:", JSON.stringify(testOrderData, null, 2));

    // Test local API endpoint first
    const localResponse = await fetch(
      "http://localhost:3000/api/send-confirmation",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testOrderData),
      }
    );

    const localResult = await localResponse.json();

    if (localResponse.ok) {
      console.log("✅ Local API test successful!");
      console.log("Response:", localResult);
    } else {
      console.log("❌ Local API test failed!");
      console.log("Status:", localResponse.status);
      console.log("Error:", localResult);
    }

    // Test direct Edge Function call (if deployed)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

    if (supabaseUrl && supabaseKey) {
      console.log("\n🔗 Testing direct Edge Function call...");

      const edgeResponse = await fetch(
        `${supabaseUrl}/functions/v1/send-order-confirmation`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${supabaseKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(testOrderData),
        }
      );

      const edgeResult = await edgeResponse.json();

      if (edgeResponse.ok) {
        console.log("✅ Edge Function test successful!");
        console.log("Response:", edgeResult);
      } else {
        console.log("❌ Edge Function test failed!");
        console.log("Status:", edgeResponse.status);
        console.log("Error:", edgeResult);
      }
    } else {
      console.log(
        "ℹ️ Supabase credentials not found, skipping Edge Function test"
      );
    }
  } catch (error) {
    console.log("❌ Test error:", error.message);
  }
}

// Load environment variables
require("dotenv").config({ path: ".env.local" });

// Run test
testEmailFunction();
