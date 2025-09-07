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

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return new Response(
        JSON.stringify({ error: "orderId is required" }),
        { status: 400 }
      );
    }

    console.log("[/api/cart/clear] Clearing cart for orderId:", orderId);

    const supabase = getSupabaseClient();
    if (!supabase) {
      return new Response(
        JSON.stringify({ error: "Database not available" }),
        { status: 500 }
      );
    }

    // Create cart clearing event
    const { error } = await supabase
      .from("cart_clearing_events")
      .insert({
        order_id: orderId,
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.error("[/api/cart/clear] Error creating cart clearing event:", error);
      return new Response(
        JSON.stringify({ error: "Failed to create cart clearing event" }),
        { status: 500 }
      );
    }

    console.log("[/api/cart/clear] Cart clearing event created successfully");

    return new Response(
      JSON.stringify({ success: true, message: "Cart clearing event created" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("[/api/cart/clear] Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500 }
    );
  }
}
