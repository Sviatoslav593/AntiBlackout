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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      console.log("[/api/check-cart-clearing] Missing orderId parameter");
      return new Response(
        JSON.stringify({
          shouldClear: false,
          clearingEvent: null,
          error: "Order ID is required",
        }),
        { status: 400 }
      );
    }

    console.log(
      "[/api/check-cart-clearing] Checking cart clearing event for orderId:",
      orderId
    );

    // Check if there's a cart clearing event for this order
    // Gracefully handle any errors - never return 500
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.warn("[/api/check-cart-clearing] Supabase client not available");
      return new Response(
        JSON.stringify({
          shouldClear: false,
          clearingEvent: null,
          warning: "Database not available, defaulting to false",
        }),
        { status: 200 }
      );
    }

    const { data: clearingEvent, error } = await supabase
      .from("cart_clearing_events")
      .select("*")
      .eq("order_id", orderId)
      .single();

    // Handle errors gracefully - don't fail the request
    if (error && error.code !== "PGRST116") {
      console.warn(
        "[/api/check-cart-clearing] Warning checking cart clearing event:",
        error
      );
      // Return safe default instead of 500
      return new Response(
        JSON.stringify({
          shouldClear: false,
          clearingEvent: null,
          warning: "Could not check cart clearing event, defaulting to false",
        }),
        { status: 200 }
      );
    }

    const shouldClear = !!clearingEvent;

    if (shouldClear) {
      console.log(
        "[/api/check-cart-clearing] Cart clearing event found for orderId:",
        orderId
      );
    } else {
      console.log(
        "[/api/check-cart-clearing] No cart clearing event found for orderId:",
        orderId
      );
    }

    return new Response(
      JSON.stringify({
        shouldClear,
        clearingEvent: clearingEvent || null,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("[/api/check-cart-clearing] Error:", error);
    // Never return 500 - always return safe default
    return new Response(
      JSON.stringify({
        shouldClear: false,
        clearingEvent: null,
        error: "Service temporarily unavailable, defaulting to false",
      }),
      { status: 200 }
    );
  }
}
