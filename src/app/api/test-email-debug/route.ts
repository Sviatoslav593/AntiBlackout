import { NextRequest, NextResponse } from "next/server";
import { sendOrderEmails, formatOrderForEmail } from "@/services/emailService";

export async function POST(request: NextRequest) {
  try {
    console.log("🧪 Testing email service...");
    
    // Check environment variables
    const resendApiKey = process.env.RESEND_API_KEY;
    console.log("📧 RESEND_API_KEY exists:", !!resendApiKey);
    console.log("📧 RESEND_API_KEY length:", resendApiKey?.length || 0);
    
    if (!resendApiKey) {
      return NextResponse.json({
        error: "RESEND_API_KEY not found",
        success: false
      }, { status: 500 });
    }

    // Create test order data
    const testOrder = {
      id: "test-order-123",
      customer_name: "Test Customer",
      customer_email: "test@example.com",
      customer_phone: "+380123456789",
      city: "Київ",
      branch: "Відділення №1",
      payment_method: "online",
      total_amount: 1000,
      order_items: [
        {
          product_name: "Test Product",
          quantity: 2,
          price: 500,
          image_url: "https://example.com/image.jpg"
        }
      ]
    };

    console.log("📧 Test order data:", testOrder);

    // Format order for email
    const emailOrder = formatOrderForEmail(testOrder);
    console.log("📧 Formatted email order:", emailOrder);

    // Send test email
    const result = await sendOrderEmails(emailOrder);
    console.log("📧 Email sending result:", result);

    return NextResponse.json({
      success: true,
      message: "Test email sent",
      result: result,
      environment: {
        hasResendKey: !!resendApiKey,
        resendKeyLength: resendApiKey?.length || 0
      }
    });

  } catch (error) {
    console.error("❌ Email test error:", error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Unknown error",
      success: false
    }, { status: 500 });
  }
}
