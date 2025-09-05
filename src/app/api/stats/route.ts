import { NextResponse } from "next/server";
import { OrderService } from "@/services/orders";

// GET /api/stats - Get order statistics
export async function GET() {
  try {
    const stats = await OrderService.getOrderStats();

    return NextResponse.json({ stats });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
