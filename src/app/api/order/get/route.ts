import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const dynamic = "force-dynamic"; // Next App Router: disable caching

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");
    if (!orderId) {
      return new Response(JSON.stringify({ error: "orderId is required" }), { status: 400 });
    }

    console.log("[/api/order/get] Fetching order with ID:", orderId);

    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("id, customer_name, customer_email, customer_phone, city, branch, payment_method, status, total_amount, created_at, updated_at")
      .eq("id", orderId)
      .single();

    if (orderErr) {
      console.error("[/api/order/get] order error:", orderErr);
      return new Response(JSON.stringify({ error: "Order not found" }), { status: 404 });
    }

    const { data: itemsData, error: itemsErr } = await supabase
      .from("order_items")
      .select("id, product_name, quantity, price")
      .eq("order_id", orderId)
      .order("created_at", { ascending: true });

    if (itemsErr) {
      console.error("[/api/order/get] items error:", itemsErr);
    }

    const items = (itemsData ?? []).map((i) => ({
      id: i.id,
      product_name: i.product_name,
      quantity: i.quantity,
      price: i.price,
      subtotal: Number(i.quantity) * Number(i.price),
    }));

    const body = { ...order, items };
    
    console.log("[/api/order/get] Success:", {
      id: body.id,
      customer_name: body.customer_name,
      status: body.status,
      items_count: body.items.length,
    });

    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err: any) {
    console.error("[/api/order/get] crash:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error", details: err.message }), { status: 500 });
  }
}
