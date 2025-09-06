// Test script for email service
import { sendOrderConfirmationEmail } from "./src/services/emailService";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const testOrder = {
  id: "test-order-" + Date.now(),
  customerName: "Тест Тестович",
  customerEmail: "test@example.com", // Change to your email for testing
  items: [
    {
      productName: "PowerMax 20000мАг Швидка Зарядка",
      quantity: 2,
      price: 1200,
    },
    {
      productName: "Кабель USB-C 2m",
      quantity: 1,
      price: 100,
    },
  ],
  total: 2500,
};

async function testEmailService() {
  try {
    console.log("🧪 Testing Email Service...");
    console.log("Order data:", JSON.stringify(testOrder, null, 2));

    // Check if RESEND_API_KEY is set
    if (!process.env.RESEND_API_KEY) {
      console.log("❌ RESEND_API_KEY not found in environment variables");
      console.log("Please add RESEND_API_KEY to your .env.local file");
      return;
    }

    console.log("✅ RESEND_API_KEY found");

    // Test email sending
    const result = await sendOrderConfirmationEmail(testOrder);

    if (result.success) {
      console.log("✅ Email sent successfully!");
      console.log("Result:", result);
    } else {
      console.log("❌ Email sending failed!");
      console.log("Error:", result.error);
    }
  } catch (error) {
    console.log(
      "❌ Test error:",
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}

// Run test
testEmailService();
