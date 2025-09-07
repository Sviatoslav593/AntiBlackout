import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

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

    // 1) Fetch order base
    const { data: order, error: orderErr } = await supabaseAdmin
      .from("orders")
      .select(
        "id, customer_name, customer_email, customer_phone, city, branch, status, payment_method, total_amount, created_at, updated_at"
      )
      .eq("id", orderId)
      .single();

    if (orderErr) {
      console.error("[/api/order/get] order error:", orderErr);
      return new Response(JSON.stringify({ error: "Order not found" }), {
        status: 404,
      });
    }

    // 2) Fetch items from order_items
    const { data: itemsData, error: itemsErr } = await supabaseAdmin
      .from("order_items")
      .select("id, product_name, quantity, price, product_price, product_image")
      .eq("order_id", orderId)
      .order("created_at", { ascending: true });

    if (itemsErr) {
      console.error("[/api/order/get] items error:", itemsErr);
    }

    // Handle price vs product_price columns
    const items = (itemsData ?? []).map((i: any) => {
      const unitPrice = i.product_price ?? i.price ?? 0;
      return {
        id: i.id,
        product_name: i.product_name,
        quantity: i.quantity,
        price: Number(unitPrice),
        subtotal: Number(unitPrice) * Number(i.quantity),
        product_image: i.product_image || null, // Include product image
      };
    });

    // Normalize payment method
    const paymentMethod = (order.payment_method || "").toLowerCase();
    const normalizedPM =
      paymentMethod === "online" || paymentMethod === "card" ? "online" : "cod";

    const response = {
      ...order,
      payment_method: normalizedPM,
      items,
    };

    console.log("[/api/order/get] Success:", {
      id: response.id,
      customer_name: response.customer_name,
      status: response.status,
      payment_method: response.payment_method,
      items_count: response.items.length,
    });

    return new Response(JSON.stringify(response), {
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
