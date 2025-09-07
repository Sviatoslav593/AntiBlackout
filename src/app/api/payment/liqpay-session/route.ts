import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const LIQPAY_PUBLIC_KEY =
  process.env.LIQPAY_PUBLIC_KEY || "sandbox_i1881916757";
const LIQPAY_PRIVATE_KEY =
  process.env.LIQPAY_PRIVATE_KEY ||
  "sandbox_i4PTRrU9ZfD0KCglN0QwJLfcJmbkoj1OJaHnRuWg";

interface LiqPaySessionRequest {
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
    console.log("🚀 Creating LiqPay session...");

    const body: LiqPaySessionRequest = await request.json();
    const { customerData, items, totalAmount } = body;

    // Generate unique order ID for this payment session
    const orderId = `liqpay_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Store payment session data in Supabase (optional for testing)
    try {
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
        console.warn(
          "⚠️ Warning: Could not store payment session in database:",
          sessionError.message
        );
        console.log("📝 Continuing without database storage for testing...");
      } else {
        console.log(`✅ Payment session stored in database: ${orderId}`);
      }
    } catch (dbError) {
      console.warn(
        "⚠️ Warning: Database error, continuing without storage:",
        dbError
      );
    }

    // Prepare LiqPay payment data
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "https://antiblackout.shop";

    const liqPayData = {
      version: 3,
      public_key: LIQPAY_PUBLIC_KEY,
      action: "pay",
      amount: parseFloat(totalAmount).toFixed(2), // Correct amount in UAH
      currency: "UAH",
      description: `Замовлення #${orderId} - AntiBlackout`,
      order_id: orderId,
      result_url: `${siteUrl}/order-success?orderId=${orderId}`,
      server_url: `${siteUrl}/api/payment/liqpay-callback`,
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

    console.log(`✅ LiqPay session data prepared for order: ${orderId}`);
    console.log("📝 Base64 data length:", dataString.length);
    console.log("🔐 Signature length:", signature.length);

    return NextResponse.json({
      success: true,
      orderId,
      data: dataString,
      signature,
      publicKey: LIQPAY_PUBLIC_KEY,
      debug: {
        amount: totalAmount,
        amountInUAH: totalAmount / 100,
        orderId,
        siteUrl,
      },
    });
  } catch (error) {
    console.error("❌ Error creating LiqPay session:", error);
    return NextResponse.json(
      {
        error: "Failed to create payment session",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
