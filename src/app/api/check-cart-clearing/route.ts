import { NextRequest } from "next/server";
import { shouldClearCart } from "@/lib/db/orders";

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

    // Check if there's a cart clearing event for this order using data-access layer
    const { shouldClear, error } = await shouldClearCart(orderId);

    // Handle errors gracefully - don't fail the request
    if (error) {
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
        clearingEvent: shouldClear ? { order_id: orderId } : null,
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
