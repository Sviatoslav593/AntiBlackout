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

    // Send confirmation email
    try {
      console.log("📧 Sending confirmation email...");
      await sendOrderEmails(orderData.id);
      console.log("✅ Confirmation email sent successfully");
    } catch (emailError) {
      console.error("❌ Error sending confirmation email:", emailError);
      // Don't fail the request if email fails
    }

    // Create cart clearing event
    try {
      console.log("🧹 Creating cart clearing event...");
      const { error: cartError } = await supabaseAdmin
        .from("cart_clearing_events")
        .insert([
          {
            order_id: orderData.id,
            cleared_at: new Date().toISOString(),
          },
        ]);

      if (cartError) {
        console.error("❌ Error creating cart clearing event:", cartError);
      } else {
        console.log("✅ Cart clearing event created");
      }
    } catch (cartError) {
      console.error("❌ Error creating cart clearing event:", cartError);
    }

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
