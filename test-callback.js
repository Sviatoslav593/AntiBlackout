// Test script to check if callback functionality works
const testCallback = async () => {
  try {
    console.log("🧪 Testing callback functionality...");
    
    const response = await fetch("http://localhost:3000/api/test-callback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();
    
    if (result.success) {
      console.log("✅ Test callback successful:", result);
    } else {
      console.error("❌ Test callback failed:", result);
    }
  } catch (error) {
    console.error("❌ Test callback error:", error);
  }
};

// Run the test
testCallback();
