import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");
    
    if (!orderId) {
      console.error("[/api/order/get] Missing orderId parameter");
      return new Response(JSON.stringify({ error: "orderId is required" }), { status: 400 });
    }

    console.log("[/api/order/get] Fetching order with ID:", orderId);

    // JOIN order_items via PostgREST relational select
    const { data, error } = await supabase
      .from("orders")
      .select(`
        id, 
        customer_name, 
        customer_email, 
        customer_phone, 
        city, 
        branch, 
        payment_method, 
        status, 
        total_amount, 
        created_at,
        updated_at,
        order_items(id, product_name, quantity, price)
      `)
      .eq("id", orderId)
      .single();

    if (error) {
      console.error("[/api/order/get] Supabase error:", error);
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    if (!data) {
      console.error("[/api/order/get] Order not found:", orderId);
      return new Response(JSON.stringify({ error: "Order not found" }), { status: 404 });
    }

    // Normalize to a stable shape: always return `items: [...]`
    const items = (data?.order_items ?? []).map((i: any) => ({
      id: i.id,
      product_name: i.product_name,
      quantity: i.quantity,
      price: i.price,
      subtotal: Number(i.quantity) * Number(i.price),
    }));

    const response = {
      id: data.id,
      customer_name: data.customer_name,
      customer_email: data.customer_email,
      customer_phone: data.customer_phone,
      city: data.city,
      branch: data.branch,
      payment_method: data.payment_method,
      status: data.status,
      total_amount: data.total_amount,
      created_at: data.created_at,
      updated_at: data.updated_at,
      items,
    };

    console.log("[/api/order/get] Success:", {
      id: response.id,
      customer_name: response.customer_name,
      status: response.status,
      items_count: response.items.length,
    });

    return new Response(JSON.stringify(response), { status: 200 });
  } catch (err: any) {
    console.error("[/api/order/get] Crash:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error", details: err.message }), { status: 500 });
  }
}
