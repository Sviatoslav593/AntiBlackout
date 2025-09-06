import { NextRequest, NextResponse } from "next/server";
import { OrderService } from "@/services/orders";

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

    // Get order from Supabase
    const order = await OrderService.getOrderById(orderId);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Return order data for success page
    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        customer_name: order.customer_name,
        customer_email: order.customer_email,
        customer_phone: order.customer_phone,
        city: order.city,
        branch: order.branch,
        payment_method: order.payment_method,
        total_amount: order.total_amount,
        status: order.status,
        payment_status: order.payment_status,
        created_at: order.created_at,
        order_items: order.order_items,
      },
    });
  } catch (error) {
    console.error("Error fetching order success data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
