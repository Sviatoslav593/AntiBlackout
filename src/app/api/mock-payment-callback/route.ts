import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

/**
 * Mock LiqPay callback for sandbox testing
 * This simulates what LiqPay would send to our callback endpoint
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, status = "success" } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    console.log(`🧪 Mock LiqPay callback for order ${orderId} with status ${status}`);

    // Simulate LiqPay callback data
    const callbackData = {
      order_id: orderId,
      status: status,
      transaction_id: `mock-txn-${Date.now()}`,
      amount: 1000, // Mock amount
      currency: "UAH",
      description: "Mock payment for testing",
      payment_id: `mock-payment-${Date.now()}`,
      paytype: "card",
      public_key: process.env.LIQPAY_PUBLIC_KEY,
      acq_id: 12345,
      liqpay_order_id: `mock-liqpay-${Date.now()}`,
      type: "buy",
      sender_phone: "+380000000000",
      sender_card_mask2: "1234****5678",
      sender_card_bank: "Test Bank",
      sender_card_type: "Visa",
      sender_card_country: 804,
      ip: "127.0.0.1",
    };

    // Encode data as LiqPay would
    const dataString = JSON.stringify(callbackData);
    const data = Buffer.from(dataString).toString("base64");

    // Generate signature as LiqPay would
    const privateKey = process.env.LIQPAY_PRIVATE_KEY;
    if (!privateKey) {
      return NextResponse.json(
        { error: "LiqPay private key not configured" },
        { status: 500 }
      );
    }

    const signatureString = privateKey + data + privateKey;
    const signature = crypto
      .createHash("sha1")
      .update(signatureString)
      .digest("base64");

    // Send to our actual callback endpoint
    const callbackUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/payment/callback`;
    
    const formData = new FormData();
    formData.append("data", data);
    formData.append("signature", signature);

    console.log(`🔄 Sending mock callback to ${callbackUrl}`);

    const response = await fetch(callbackUrl, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (response.ok) {
      console.log(`✅ Mock callback successful for order ${orderId}`);
      return NextResponse.json({
        success: true,
        message: `Mock callback sent for order ${orderId}`,
        callbackData,
        result,
      });
    } else {
      console.error(`❌ Mock callback failed for order ${orderId}:`, result);
      return NextResponse.json(
        { error: "Mock callback failed", details: result },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("❌ Error in mock callback:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to trigger mock callback manually
 * Usage: GET /api/mock-payment-callback?orderId=AB-123&status=success
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("orderId");
  const status = searchParams.get("status") || "success";

  if (!orderId) {
    return NextResponse.json(
      { error: "Order ID is required as query parameter" },
      { status: 400 }
    );
  }

  // Call POST method with the parameters
  const mockRequest = new NextRequest(request.url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId, status }),
  });

  return POST(mockRequest);
}
