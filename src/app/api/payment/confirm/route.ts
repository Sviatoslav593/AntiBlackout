import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sendOrderEmails } from "@/services/emailService";

export async function POST(request: NextRequest) {
  try {
    console.log("🔄 Confirming payment...");

    const body = await request.json();
    const { orderId, paymentData } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    console.log("📋 Confirming payment for order:", orderId);

    // Update order status to paid
    const { data: orderData, error: updateError } = await supabaseAdmin
      .from("orders")
      .update({
        status: "paid",
        payment_status: "success",
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .select()
      .single();

    if (updateError) {
      console.error("❌ Error updating order status:", updateError);
      return NextResponse.json(
        { error: "Failed to update order status" },
        { status: 500 }
      );
    }

    if (!orderData) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    console.log("✅ Payment confirmed for order:", orderData.id);
    // Email and cart clearing already handled in checkout

    return NextResponse.json({
      success: true,
      orderId: orderData.id,
      status: orderData.status,
      message: "Payment confirmed successfully",
    });
  } catch (error) {
    console.error("❌ Error confirming payment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
