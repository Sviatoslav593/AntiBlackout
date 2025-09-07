import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client with proper error handling
const getSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase environment variables");
    return null;
  }
  
  return createClient(supabaseUrl, supabaseKey);
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");
    
    if (!orderId) {
      return new Response(JSON.stringify({ error: "orderId is required" }), { status: 400 });
    }

    console.log("[/api/order/get] Fetching order with ID:", orderId);

    const supabase = getSupabaseClient();
    if (!supabase) {
      return new Response(
        JSON.stringify({ error: "Database not available" }),
        { status: 500 }
      );
    }

    // Fetch order base
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("id, customer_name, customer_email, customer_phone, city, branch, payment_method, status, total_amount, created_at, updated_at")
      .eq("id", orderId)
      .single();

    if (orderErr) {
      console.error("[/api/order/get] order error:", orderErr);
      return new Response(JSON.stringify({ error: orderErr.message }), { status: 404 });
    }

    // Fetch items from order_items
    const { data: itemsData, error: itemsErr } = await supabase
      .from("order_items")
      .select("id, product_name, quantity, price")
      .eq("order_id", orderId)
      .order("created_at", { ascending: true });

    if (itemsErr) {
      console.error("[/api/order/get] items error:", itemsErr);
      // Still return base order with empty items (never block UI)
    }

    const items = (itemsData ?? []).map((i) => ({
      id: i.id,
      product_name: i.product_name,
      quantity: i.quantity,
      price: i.price,
      subtotal: Number(i.quantity) * Number(i.price),
    }));

    const response = {
      ...order,
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
    console.error("[/api/order/get] crash:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error", details: err.message }), { status: 500 });
  }
}
