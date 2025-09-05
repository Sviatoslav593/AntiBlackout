import { NextRequest, NextResponse } from "next/server";
import { OrderService } from "@/services/orders";

// GET /api/orders - Get all orders
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    let orders;
    if (status) {
      orders = await OrderService.getOrdersByStatus(
        status as
          | "pending"
          | "confirmed"
          | "shipped"
          | "delivered"
          | "cancelled"
      );
    } else {
      orders = await OrderService.getAllOrders();
    }

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
