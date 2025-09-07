import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";

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

    console.log("🔍 Checking cart clearing event for orderId:", orderId);

    const supabase = createServerSupabaseClient();

    // Check if there's a cart clearing event for this order
    const { data: clearingEvent, error } = await supabase
      .from("cart_clearing_events")
      .select("*")
      .eq("order_id", orderId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("❌ Error checking cart clearing event:", error);
      return NextResponse.json(
        { error: "Failed to check cart clearing event" },
        { status: 500 }
      );
    }

    const shouldClear = !!clearingEvent;
    
    if (shouldClear) {
      console.log("✅ Cart clearing event found for orderId:", orderId);
    } else {
      console.log("ℹ️ No cart clearing event found for orderId:", orderId);
    }

    return NextResponse.json({
      shouldClear,
      clearingEvent: clearingEvent || null,
    });
  } catch (error) {
    console.error("❌ Error in check-cart-clearing:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
