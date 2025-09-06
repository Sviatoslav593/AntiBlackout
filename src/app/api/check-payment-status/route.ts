import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    console.log(`🔍 Checking payment status for order: ${orderId}`);

    // Check if order exists in Supabase
    const supabase = createServerSupabaseClient();
    const { data: order, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (error || !order) {
      console.log(`❌ Order not found: ${orderId}`);
      return NextResponse.json({
        success: false,
        exists: false,
        message: "Order not found",
      });
    }

    console.log(`✅ Order found: ${order.id}, status: ${order.status}`);

    return NextResponse.json({
      success: true,
      exists: true,
      order: {
        id: order.id,
        status: order.status,
        payment_status: order.payment_status,
        customer_name: order.customer_name,
        total_amount: order.total_amount,
        created_at: order.created_at,
      },
    });
  } catch (error) {
    console.error("❌ Error checking payment status:", error);
    return NextResponse.json(
      { error: "Failed to check payment status" },
      { status: 500 }
    );
  }
}
