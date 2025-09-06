import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createServerSupabaseClient } from "@/lib/supabase";

interface LiqPayCallback {
  data: string;
  signature: string;
}

interface LiqPayCallbackData {
  order_id: string;
  status: string;
  transaction_id?: string;
  amount?: number;
  currency?: string;
  description?: string;
  payment_id?: string;
  paytype?: string;
  public_key?: string;
  acq_id?: number;
  liqpay_order_id?: string;
  type?: string;
  sender_phone?: string;
  sender_card_mask2?: string;
  sender_card_bank?: string;
  sender_card_type?: string;
  sender_card_country?: number;
  ip?: string;
  err_code?: string;
  err_description?: string;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const data = formData.get("data") as string;
    const signature = formData.get("signature") as string;

    if (!data || !signature) {
      console.error("❌ Missing data or signature in LiqPay callback");
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Verify signature
    const privateKey = process.env.LIQPAY_PRIVATE_KEY;
    if (!privateKey) {
      console.error("❌ LiqPay private key not configured");
      return NextResponse.json(
        { error: "Payment service not configured" },
        { status: 500 }
      );
    }

    // Verify signature: SHA1(privateKey + data + privateKey)
    const expectedSignature = crypto
      .createHash("sha1")
      .update(privateKey + data + privateKey)
      .digest("base64");

    if (signature !== expectedSignature) {
      console.error("❌ Invalid LiqPay signature");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    // Decode and parse callback data
    const decodedData = Buffer.from(data, "base64").toString("utf-8");
    const callbackData: LiqPayCallbackData = JSON.parse(decodedData);

    console.log("📞 LiqPay callback received:", {
      orderId: callbackData.order_id,
      status: callbackData.status,
      amount: callbackData.amount,
      currency: callbackData.currency,
    });

    // Update order status in Supabase
    await updateOrderStatus(callbackData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Error processing LiqPay callback:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function updateOrderStatus(callbackData: LiqPayCallbackData) {
  try {
    const supabase = createServerSupabaseClient();

    // Map LiqPay status to our order status
    let orderStatus = "pending";
    switch (callbackData.status) {
      case "success":
        orderStatus = "paid";
        break;
      case "failure":
        orderStatus = "failed";
        break;
      case "error":
        orderStatus = "error";
        break;
      case "reversed":
        orderStatus = "refunded";
        break;
      default:
        orderStatus = "pending";
    }

    // Update order in Supabase
    const { error } = await supabase
      .from("orders")
      .update({
        status: orderStatus,
        payment_status: callbackData.status,
        payment_id: callbackData.payment_id || callbackData.transaction_id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", callbackData.order_id);

    if (error) {
      console.error("❌ Error updating order status:", error);
      throw error;
    }

    console.log(`✅ Order ${callbackData.order_id} status updated to: ${orderStatus}`);

    // Log payment details
    if (callbackData.status === "success") {
      console.log(`💰 Payment successful for order ${callbackData.order_id}:`, {
        amount: callbackData.amount,
        currency: callbackData.currency,
        paymentId: callbackData.payment_id,
        transactionId: callbackData.transaction_id,
      });
    }
  } catch (error) {
    console.error("❌ Error updating order status in Supabase:", error);
    throw error;
  }
}
