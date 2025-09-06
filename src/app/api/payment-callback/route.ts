import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createServerSupabaseClient } from "@/lib/supabase";
import { OrderService } from "@/services/orders";
import { sendOrderEmails, formatOrderForEmail } from "@/services/emailService";

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
    console.log(`🔄 Processing payment callback for order ${callbackData.order_id}`);

    if (callbackData.status === "success") {
      // Payment successful - create the order in Supabase
      await createOrderAfterPayment(callbackData);
    } else {
      // Payment failed - log the failure
      console.log(`❌ Payment failed for order ${callbackData.order_id}:`, {
        status: callbackData.status,
        error: callbackData.err_description,
      });
    }
  } catch (error) {
    console.error("❌ Error processing payment callback:", error);
    throw error;
  }
}

async function createOrderAfterPayment(callbackData: LiqPayCallbackData) {
  try {
    // In a real implementation, you would retrieve the order data from a temporary store
    // For now, we'll create a basic order structure
    // In production, store order data in Redis or database during payment preparation
    
    // Try to get order data from the callback data or use defaults
    const orderData = {
      customer_name: callbackData.sender_phone ? `Customer ${callbackData.sender_phone}` : "Customer",
      customer_email: "customer@example.com", // This should come from stored order data
      customer_phone: callbackData.sender_phone || "+380000000000",
      city: "Київ", // This should come from stored order data
      branch: "Відділення №1", // This should come from stored order data
      payment_method: "online",
      total_amount: callbackData.amount || 0,
      items: [], // This should come from stored order data
      status: "paid",
      payment_status: callbackData.status,
      payment_id: callbackData.payment_id || callbackData.transaction_id,
    };

    // Create order in Supabase
    const order = await OrderService.createOrder(orderData);

    console.log(`✅ Order created successfully after payment: ${order.id}`);

    // Send confirmation emails
    try {
      const emailOrder = formatOrderForEmail(order);
      await sendOrderEmails(emailOrder);
      console.log(`📧 Confirmation emails sent for order ${order.id}`);
    } catch (emailError) {
      console.error("⚠️ Email sending failed (non-critical):", emailError);
    }

    // Log payment details
    console.log(`💰 Payment successful for order ${callbackData.order_id}:`, {
      amount: callbackData.amount,
      currency: callbackData.currency,
      paymentId: callbackData.payment_id,
      transactionId: callbackData.transaction_id,
      orderId: order.id,
    });

  } catch (error) {
    console.error("❌ Error creating order after payment:", error);
    throw error;
  }
}
