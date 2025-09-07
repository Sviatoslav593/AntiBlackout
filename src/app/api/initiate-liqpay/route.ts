import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const LIQPAY_PUBLIC_KEY = process.env.LIQPAY_PUBLIC_KEY;
const LIQPAY_PRIVATE_KEY = process.env.LIQPAY_PRIVATE_KEY;

if (!LIQPAY_PUBLIC_KEY || !LIQPAY_PRIVATE_KEY) {
  throw new Error("LiqPay keys are missing from environment variables");
}

interface InitiateLiqPayRequest {
  customerData: {
    name: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    city: string;
    branch: string;
  };
  items: Array<{
    id: number;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }>;
  totalAmount: number;
}

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 Initiating LiqPay payment...");

    const body: InitiateLiqPayRequest = await request.json();
    const { customerData, items, totalAmount } = body;

    // Generate unique order ID for this payment session
    const orderId = `liqpay_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Store payment session data in Supabase
    const paymentSessionData = {
      order_id: orderId,
      customer_data: customerData,
      items: items,
      total_amount: totalAmount,
      status: "pending",
      created_at: new Date().toISOString(),
    };

    const { error: sessionError } = await supabaseAdmin
      .from("payment_sessions")
      .insert([paymentSessionData]);

    if (sessionError) {
      console.error("❌ Error storing payment session:", sessionError);
      return NextResponse.json(
        { error: "Failed to create payment session" },
        { status: 500 }
      );
    }

    console.log(`✅ Payment session created: ${orderId}`);

    // Prepare LiqPay payment data
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "https://antiblackout.shop";

    const liqPayData = {
      version: 3,
      public_key: LIQPAY_PUBLIC_KEY,
      action: "pay",
      amount: totalAmount / 100, // Convert from kopecks to UAH
      currency: "UAH",
      description: `Замовлення #${orderId} - AntiBlackout`,
      order_id: orderId,
      result_url: `${siteUrl}/order-success?orderId=${orderId}`,
      server_url: `${siteUrl}/api/liqpay-callback`,
      language: "uk",
    };

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

    // Create payment URL
    const paymentUrl = `https://www.liqpay.ua/api/3/checkout?data=${dataString}&signature=${signature}`;

    console.log(`✅ LiqPay payment URL generated for order: ${orderId}`);

    return NextResponse.json({
      success: true,
      paymentUrl,
      orderId,
    });
  } catch (error) {
    console.error("❌ Error initiating LiqPay payment:", error);
    return NextResponse.json(
      {
        error: "Failed to initiate payment",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
