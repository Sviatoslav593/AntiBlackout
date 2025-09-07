import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";
import { sendOrderEmails, formatOrderForEmail } from "@/services/emailService";

interface TestPaymentRequest {
  orderId: string;
  status?: "success" | "failed";
}

export async function POST(request: NextRequest) {
  try {
    const body: TestPaymentRequest = await request.json();
    const { orderId, status = "success" } = body;

    console.log(
      `🧪 Test payment simulation for order ${orderId} with status ${status}`
    );

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Find the order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      console.error("❌ Order not found:", orderId);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status === "paid") {
      console.log("⚠️ Order is already paid");
      return NextResponse.json({
        success: true,
        message: "Order is already paid",
        order: order,
      });
    }

    if (status === "success") {
      // Simulate successful payment
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          status: "paid",
          payment_status: "success",
          payment_id: `test-payment-${Date.now()}`,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId);

      if (updateError) {
        console.error("❌ Error updating order status:", updateError);
        return NextResponse.json(
          { error: "Failed to update order status" },
          { status: 500 }
        );
      }

      console.log(`✅ Order ${orderId} marked as paid`);

      // Send confirmation emails
      try {
        const emailOrder = formatOrderForEmail(order);
        await sendOrderEmails(emailOrder);
        console.log(`📧 Test confirmation emails sent for order ${orderId}`);
      } catch (emailError) {
        console.error("⚠️ Email sending failed (non-critical):", emailError);
      }

      // Create cart clearing event
      try {
        await supabase.from("cart_clearing_events").insert({
          order_id: orderId,
          cleared_at: new Date().toISOString(),
        });
        console.log(`🧹 Cart clearing event created for test order ${orderId}`);
      } catch (clearError) {
        console.error("⚠️ Error creating cart clearing event:", clearError);
      }

      return NextResponse.json({
        success: true,
        message: "Payment simulation successful",
        orderId: orderId,
        status: "paid",
        paymentId: `test-payment-${Date.now()}`,
      });
    } else {
      // Simulate failed payment
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          status: "failed",
          payment_status: "failed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId);

      if (updateError) {
        console.error("❌ Error updating order status:", updateError);
        return NextResponse.json(
          { error: "Failed to update order status" },
          { status: 500 }
        );
      }

      console.log(`❌ Order ${orderId} marked as failed`);

      return NextResponse.json({
        success: true,
        message: "Payment simulation failed",
        orderId: orderId,
        status: "failed",
      });
    }
  } catch (error) {
    console.error("❌ Error in test payment simulation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to trigger test payment manually
 * Usage: GET /api/test-payment?orderId=AB-123&status=success
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("orderId");
  const status =
    (searchParams.get("status") as "success" | "failed") || "success";

  if (!orderId) {
    return NextResponse.json(
      { error: "Order ID is required as query parameter" },
      { status: 400 }
    );
  }

  // Call POST method with the parameters
  const mockRequest = new NextRequest(request.url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId, status }),
  });

  return POST(mockRequest);
}
