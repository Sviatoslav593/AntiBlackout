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
    console.log(
      `🔄 Processing payment callback for order ${callbackData.order_id}`
    );

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
    // Get stored order data from pending_orders table
    const supabase = createServerSupabaseClient();

    const { data: pendingOrder, error: pendingError } = await supabase
      .from("pending_orders")
      .select("*")
      .eq("id", callbackData.order_id)
      .single();

    if (pendingError || !pendingOrder) {
      console.log("⚠️ Pending orders table not available or order not found, using fallback data");
      // Fallback to basic order data
      const orderData = {
        customer_name: callbackData.sender_phone
          ? `Customer ${callbackData.sender_phone}`
          : "Customer",
        customer_email: "customer@example.com",
        customer_phone: callbackData.sender_phone || "+380000000000",
        city: "Київ",
        branch: "Відділення №1",
        payment_method: "online",
        total_amount: callbackData.amount || 0,
        items: [],
        status: "paid",
        payment_status: callbackData.status,
        payment_id: callbackData.payment_id || callbackData.transaction_id,
      };

      const order = await OrderService.createOrder(orderData);
      console.log(`✅ Order created with fallback data: ${order.id}`);
      
      // Send confirmation emails
      try {
        const emailOrder = formatOrderForEmail(order);
        await sendOrderEmails(emailOrder);
        console.log(`📧 Confirmation emails sent for order ${order.id}`);
      } catch (emailError) {
        console.error("⚠️ Email sending failed (non-critical):", emailError);
      }
      return;
    }

    // Use stored order data
    const customerData = pendingOrder.customer_data;
    const items = pendingOrder.items;

    const orderData = {
      customer_name: customerData.name || "Customer",
      customer_email: customerData.email || "customer@example.com",
      customer_phone:
        customerData.phone || callbackData.sender_phone || "+380000000000",
      city: customerData.city || "Київ",
      branch: customerData.warehouse || customerData.address || "Відділення №1",
      payment_method: "online",
      total_amount: pendingOrder.amount || callbackData.amount || 0,
      items: items.map((item: any) => ({
        product_name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      status: "paid",
      payment_status: callbackData.status,
      payment_id: callbackData.payment_id || callbackData.transaction_id,
    };

    // Create order in Supabase
    const order = await OrderService.createOrder(orderData);

    console.log(`✅ Order created successfully after payment: ${order.id}`);

    // Clean up pending order
    try {
      await supabase
        .from("pending_orders")
        .delete()
        .eq("id", callbackData.order_id);
      console.log(`🧹 Pending order cleaned up: ${callbackData.order_id}`);
    } catch (cleanupError) {
      console.error("⚠️ Error cleaning up pending order:", cleanupError);
    }

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
