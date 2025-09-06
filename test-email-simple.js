// Simple email test
const testEmailSimple = async () => {
  try {
    console.log("🧪 Testing email sending...");
    
    const response = await fetch("http://localhost:3000/api/test-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();
    console.log("📧 Email test result:", result);
    
    if (result.success) {
      console.log("✅ Email test successful!");
    } else {
      console.log("❌ Email test failed:", result.error);
    }
    
  } catch (error) {
    console.error("❌ Email test error:", error);
  }
};

// Run the test
testEmailSimple();
