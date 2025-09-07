import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createServerSupabaseClient } from "@/lib/supabase";
import { OrderService } from "@/services/orders";
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

async function handleSuccessfulPayment(callbackData: LiqPayCallbackData) {
  try {
    console.log(`🔄 Handling successful payment for ${callbackData.order_id}`);
    
    const supabase = createServerSupabaseClient();

    // First, try to get the pending order from pending_orders table
    const { data: pendingOrder, error: pendingError } = await supabase
      .from("pending_orders")
      .select("*")
      .eq("id", callbackData.order_id)
      .single();

    if (pendingError || !pendingOrder) {
      console.log(
        "⚠️ Pending order not found, trying to find existing order"
      );
      
      // Try to find existing order in orders table
      const { data: existingOrder, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", callbackData.order_id)
        .single();

      if (existingOrder) {
        // Update existing order status
        await updateOrderStatus(existingOrder, callbackData);
        return;
      } else {
        console.error("❌ No pending or existing order found for:", callbackData.order_id);
        return;
      }
    }

    // Use pending order data to create final order
    const customerData = pendingOrder.customer_data;
    const items = pendingOrder.items;

    const orderData = {
      customer_name: customerData.name || "Customer",
      customer_email: customerData.email || "customer@example.com",
      customer_phone: customerData.phone || callbackData.sender_phone || "+380000000000",
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

    // Create final order in Supabase
    const order = await OrderService.createOrder(orderData);
    console.log(`✅ Final order created: ${order.id}`);

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

    // Create cart clearing event
    try {
      await supabase
        .from("cart_clearing_events")
        .insert({
          order_id: callbackData.order_id,
          cleared_at: new Date().toISOString(),
        });
      console.log(`🧹 Cart clearing event created for order ${callbackData.order_id}`);
    } catch (clearError) {
      console.error("⚠️ Error creating cart clearing event:", clearError);
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
    console.error("❌ Error handling successful payment:", error);
    throw error;
  }
}

async function updateOrderStatus(existingOrder: any, callbackData: LiqPayCallbackData) {
  try {
    console.log(`🔄 Updating existing order status for ${callbackData.order_id}`);
    
    const supabase = createServerSupabaseClient();

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
      console.log(`📧 Confirmation emails sent for existing order ${callbackData.order_id}`);
    } catch (emailError) {
      console.error("⚠️ Email sending failed (non-critical):", emailError);
    }

    // Create cart clearing event
    try {
      await supabase
        .from("cart_clearing_events")
        .insert({
          order_id: callbackData.order_id,
          cleared_at: new Date().toISOString(),
        });
      console.log(`🧹 Cart clearing event created for existing order ${callbackData.order_id}`);
    } catch (clearError) {
      console.error("⚠️ Error creating cart clearing event:", clearError);
    }
  } catch (error) {
    console.error("❌ Error updating order status:", error);
    throw error;
  }
}
