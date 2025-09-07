import { NextRequest } from "next/server";
import { getOrderWithItems } from "@/lib/db/orders";

export const dynamic = "force-dynamic"; // Next App Router: disable caching

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");
    if (!orderId) {
      return new Response(JSON.stringify({ error: "orderId is required" }), {
        status: 400,
      });
    }

    console.log("[/api/order/get] Fetching order with ID:", orderId);

    const { order, error } = await getOrderWithItems(orderId);

    if (error) {
      console.error("[/api/order/get] error:", error);
      return new Response(JSON.stringify({ error: "Order not found" }), {
        status: 404,
      });
    }

    if (!order) {
      console.error("[/api/order/get] order is null");
      return new Response(JSON.stringify({ error: "Order not found" }), {
        status: 404,
      });
    }

    console.log("[/api/order/get] Success:", {
      id: order.id,
      customer_name: order.customer_name,
      status: order.status,
      payment_method: order.payment_method,
      items_count: order.items.length,
    });

    return new Response(JSON.stringify(order), {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err: any) {
    console.error("[/api/order/get] crash:", err);
    return new Response(
      JSON.stringify({ error: "Internal Server Error", details: err.message }),
      { status: 500 }
    );
  }
}
