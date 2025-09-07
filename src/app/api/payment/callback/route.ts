import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createServerSupabaseClient } from "@/lib/supabase";
import { sendOrderEmails, formatOrderForEmail } from "@/services/emailService";

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
    console.log("📞 LiqPay callback received at /api/payment/callback");

    const formData = await request.formData();
    const data = formData.get("data") as string;
    const signature = formData.get("signature") as string;

    console.log("📞 Callback data:", {
      data: data?.substring(0, 50) + "...",
      signature: signature?.substring(0, 20) + "...",
    });

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
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
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

    // Process payment callback
    await processPaymentCallback(callbackData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Error processing LiqPay callback:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function processPaymentCallback(callbackData: LiqPayCallbackData) {
  try {
    console.log(
      `🔄 Processing payment callback for order ${callbackData.order_id}`
    );

    if (callbackData.status === "success") {
      // Payment successful - update order status and send email
      console.log(
        `✅ Payment successful, updating order for ${callbackData.order_id}`
      );
      await handleSuccessfulPayment(callbackData);
    } else {
      // Payment failed - update order status to failed
      console.log(`❌ Payment failed for order ${callbackData.order_id}:`, {
        status: callbackData.status,
        error: callbackData.err_description,
      });
      await handleFailedPayment(callbackData);
    }
  } catch (error) {
    console.error("❌ Error processing payment callback:", error);
    throw error;
  }
}

async function handleSuccessfulPayment(callbackData: LiqPayCallbackData) {
  try {
    console.log(`🔄 Handling successful payment for ${callbackData.order_id}`);

    const supabase = createServerSupabaseClient();

    // Find existing order in orders table
    const { data: existingOrder, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", callbackData.order_id)
      .single();

    if (orderError || !existingOrder) {
      console.error("❌ Order not found for:", callbackData.order_id);
      return;
    }

    // Update order status to paid
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status: "paid",
        payment_status: callbackData.status,
        payment_id: callbackData.payment_id || callbackData.transaction_id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", callbackData.order_id);

    if (updateError) {
      console.error("❌ Error updating order status:", updateError);
      return;
    }

    console.log(`✅ Order status updated to paid for ${callbackData.order_id}`);

    // Send confirmation emails
    try {
      const emailOrder = formatOrderForEmail(existingOrder);
      await sendOrderEmails(emailOrder);
      console.log(
        `📧 Confirmation emails sent for order ${callbackData.order_id}`
      );
    } catch (emailError) {
      console.error("⚠️ Email sending failed (non-critical):", emailError);
    }

    // Create cart clearing event
    try {
      await supabase.from("cart_clearing_events").insert({
        order_id: callbackData.order_id,
        cleared_at: new Date().toISOString(),
      });
      console.log(
        `🧹 Cart clearing event created for order ${callbackData.order_id}`
      );
    } catch (clearError) {
      console.error("⚠️ Error creating cart clearing event:", clearError);
    }

    // Log payment details
    console.log(`💰 Payment successful for order ${callbackData.order_id}:`, {
      amount: callbackData.amount,
      currency: callbackData.currency,
      paymentId: callbackData.payment_id,
      transactionId: callbackData.transaction_id,
    });
  } catch (error) {
    console.error("❌ Error handling successful payment:", error);
    throw error;
  }
}

async function handleFailedPayment(callbackData: LiqPayCallbackData) {
  try {
    console.log(`🔄 Handling failed payment for ${callbackData.order_id}`);

    const supabase = createServerSupabaseClient();

    // Update order status to failed
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status: "failed",
        payment_status: callbackData.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", callbackData.order_id);

    if (updateError) {
      console.error("❌ Error updating order status to failed:", updateError);
      return;
    }

    console.log(
      `❌ Order status updated to failed for ${callbackData.order_id}`
    );

    // Log failure details
    console.log(`💸 Payment failed for order ${callbackData.order_id}:`, {
      status: callbackData.status,
      error: callbackData.err_description,
      errorCode: callbackData.err_code,
    });
  } catch (error) {
    console.error("❌ Error handling failed payment:", error);
    throw error;
  }
}
