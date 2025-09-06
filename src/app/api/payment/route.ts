import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

interface PaymentRequest {
  amount: number;
  description: string;
  orderId: string;
  currency?: string;
}

interface LiqPayData {
  public_key: string;
  version: number;
  action: string;
  amount: number;
  currency: string;
  description: string;
  order_id: string;
  result_url: string;
  server_url: string;
  language: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: PaymentRequest = await request.json();
    const { amount, description, orderId, currency = "UAH" } = body;

    // Validate required fields
    if (!amount || !description || !orderId) {
      return NextResponse.json(
        { error: "Missing required fields: amount, description, orderId" },
        { status: 400 }
      );
    }

    // Get LiqPay keys from environment
    const publicKey = process.env.LIQPAY_PUBLIC_KEY;
    const privateKey = process.env.LIQPAY_PRIVATE_KEY;

    if (!publicKey || !privateKey) {
      console.error("LiqPay keys not configured");
      return NextResponse.json(
        { error: "Payment service not configured" },
        { status: 500 }
      );
    }

    // Get site URL for callbacks
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://antiblackout.shop";

    // Prepare LiqPay data
    const liqpayData: LiqPayData = {
      public_key: publicKey,
      version: 3,
      action: "pay",
      amount: amount,
      currency: currency,
      description: description,
      order_id: orderId,
      result_url: `${siteUrl}/order-success?orderId=${orderId}`,
      server_url: `${siteUrl}/api/payment-callback`,
      language: "uk",
    };

    // Convert to JSON and encode to base64
    const dataString = JSON.stringify(liqpayData);
    const data = Buffer.from(dataString).toString("base64");

    // Generate signature: SHA1(privateKey + data + privateKey)
    const signatureString = privateKey + data + privateKey;
    const signature = crypto
      .createHash("sha1")
      .update(signatureString)
      .digest("base64");

    console.log(`💳 LiqPay payment data generated for order ${orderId}:`, {
      amount,
      currency,
      description,
      orderId,
    });

    return NextResponse.json({
      success: true,
      data,
      signature,
      orderId,
    });
  } catch (error) {
    console.error("❌ Error generating LiqPay payment data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
