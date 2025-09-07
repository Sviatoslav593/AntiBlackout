import { NextRequest } from "next/server";
import { createCartClearingEvent } from "@/lib/db/orders";

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return new Response(JSON.stringify({ error: "orderId is required" }), {
        status: 400,
      });
    }

    console.log("[/api/cart/clear] Clearing cart for orderId:", orderId);

    // Create cart clearing event using data-access layer
    const { error } = await createCartClearingEvent(orderId);

    if (error) {
      console.error(
        "[/api/cart/clear] Error creating cart clearing event:",
        error
      );
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
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
