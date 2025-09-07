import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    console.log("🧪 Testing simple email sending...");

    // Check environment variables
    const resendApiKey = process.env.RESEND_API_KEY;
    console.log("🔧 RESEND_API_KEY:", resendApiKey ? "Set" : "Missing");

    if (!resendApiKey) {
      return NextResponse.json(
        { error: "RESEND_API_KEY not set" },
        { status: 500 }
      );
    }

    // Test basic email sending without complex logic
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "AntiBlackout <no-reply@antiblackout.shop>",
        to: ["test@example.com"],
        subject: "Test Email from AntiBlackout",
        html: "<h1>Test Email</h1><p>This is a test email from AntiBlackout.</p>",
        text: "Test Email\n\nThis is a test email from AntiBlackout.",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Resend API error: ${errorData.message || response.statusText}`);
    }

    const result = await response.json();
    console.log("📧 Email sent successfully:", result);

    return NextResponse.json({
      success: true,
      message: "Test email sent successfully",
      emailId: result.id,
    });
  } catch (error) {
    console.error("❌ Test email error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
