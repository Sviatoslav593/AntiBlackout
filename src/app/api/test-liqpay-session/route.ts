import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const LIQPAY_PUBLIC_KEY =
  process.env.LIQPAY_PUBLIC_KEY || "sandbox_i1881916757";
const LIQPAY_PRIVATE_KEY =
  process.env.LIQPAY_PRIVATE_KEY ||
  "sandbox_i4PTRrU9ZfD0KCglN0QwJLfcJmbkoj1OJaHnRuWg";

export async function POST(request: NextRequest) {
  try {
    console.log("🧪 Testing LiqPay session creation...");

    const body = await request.json();
    const { totalAmount } = body;

    // Generate unique order ID
    const orderId = `test_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    console.log("📝 Test order ID:", orderId);
    console.log("💰 Total amount:", totalAmount);

    // Prepare LiqPay payment data
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "https://antiblackout.shop";

    const liqPayData = {
      version: 3,
      public_key: LIQPAY_PUBLIC_KEY,
      action: "pay",
      amount: parseFloat(totalAmount).toFixed(2), // Correct amount in UAH
      currency: "UAH",
      description: `Тестове замовлення #${orderId} - AntiBlackout`,
      order_id: orderId,
      result_url: `${siteUrl}/order-success?orderId=${orderId}`,
      server_url: `${siteUrl}/api/payment/liqpay-callback`,
      language: "uk",
    };

    console.log("🔍 LiqPay data:", JSON.stringify(liqPayData, null, 2));

    // Create signature
    const dataString = Buffer.from(JSON.stringify(liqPayData)).toString(
      "base64"
    );
    const signatureString =
      LIQPAY_PRIVATE_KEY + dataString + LIQPAY_PRIVATE_KEY;
    const signature = crypto
      .createHash("sha1")
      .update(signatureString)
      .digest("base64");

    console.log("📝 Base64 data:", dataString);
    console.log("🔐 Signature:", signature);

    return NextResponse.json({
      success: true,
      orderId,
      data: dataString,
      signature,
      publicKey: LIQPAY_PUBLIC_KEY,
      debug: {
        liqPayData,
        dataString,
        signature,
      },
    });
  } catch (error) {
    console.error("❌ Error in test LiqPay session:", error);
    return NextResponse.json(
      {
        error: "Failed to create test payment session",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
