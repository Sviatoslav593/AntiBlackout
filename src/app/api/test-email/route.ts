import { NextRequest, NextResponse } from "next/server";
import { sendOrderEmails } from "@/services/emailService";

export async function POST(request: NextRequest) {
  try {
    console.log("🧪 Testing email sending...");

    const testOrder = {
      id: "test-order-" + Date.now(),
      customerName: "Test Customer",
      customerEmail: "test@example.com",
      customerPhone: "+380000000000",
      branch: "Test Branch",
      paymentMethod: "online",
      city: "Київ",
      items: [
        {
          productName: "Test Product",
          quantity: 1,
          price: 1000,
        },
      ],
      total: 1000,
    };

    console.log("📧 Sending test emails...");
    const result = await sendOrderEmails(testOrder);

    console.log("📧 Email result:", result);

    return NextResponse.json({
      success: true,
      message: "Test emails sent",
      result: result,
    });
  } catch (error) {
    console.error("❌ Test email error:", error);
    return NextResponse.json(
      { error: "Failed to send test emails" },
      { status: 500 }
    );
  }
}
