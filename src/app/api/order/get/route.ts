import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    console.log("📋 Fetching order details...");

    // Get order ID from query parameters
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      console.error("❌ Missing orderId parameter");
      return NextResponse.json(
        {
          error: "Missing orderId parameter",
          details: "orderId is required to fetch order details",
        },
        { status: 400 }
      );
    }

    console.log("🔍 Fetching order with ID:", orderId);

    // Validate environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("❌ Missing Supabase environment variables");
      return NextResponse.json(
        {
          error: "Server configuration error",
          details:
            "Missing required environment variables for database connection",
        },
        { status: 500 }
      );
    }

    // Initialize Supabase client
    let supabase;
    try {
      supabase = createServerSupabaseClient();
      console.log("✅ Supabase client initialized successfully");
    } catch (clientError) {
      console.error("❌ Failed to initialize Supabase client:", clientError);
      return NextResponse.json(
        {
          error: "Database connection failed",
          details:
            clientError instanceof Error
              ? clientError.message
              : "Unknown client error",
        },
        { status: 500 }
      );
    }

    // Fetch order details
    console.log("💾 Fetching order from database...");
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderError) {
      console.error("❌ Error fetching order:", orderError);
      return NextResponse.json(
        {
          error: "Failed to fetch order",
          details: orderError.message,
          code: orderError.code,
        },
        { status: 500 }
      );
    }

    if (!order) {
      console.error("❌ Order not found:", orderId);
      return NextResponse.json(
        {
          error: "Order not found",
          details: `No order found with ID: ${orderId}`,
        },
        { status: 404 }
      );
    }

    console.log("✅ Order found:", {
      id: order.id,
      customer_name: order.customer_name,
      status: order.status,
      total_amount: order.total_amount,
    });

    // Fetch order items
    console.log("📦 Fetching order items...");
    const { data: orderItems, error: itemsError } = await supabase
      .from("order_items")
      .select("id, product_name, quantity, price")
      .eq("order_id", orderId);

    if (itemsError) {
      console.error("❌ Error fetching order items:", itemsError);
      return NextResponse.json(
        {
          error: "Failed to fetch order items",
          details: itemsError.message,
          code: itemsError.code,
        },
        { status: 500 }
      );
    }

    console.log("✅ Order items found:", orderItems?.length || 0, "items");

    // Format response - ensure items is always an array
    const response = {
      id: order.id,
      customer_name: order.customer_name,
      customer_email: order.customer_email,
      customer_phone: order.customer_phone,
      city: order.city,
      branch: order.branch,
      status: order.status,
      payment_method: order.payment_method,
      total_amount: order.total_amount,
      created_at: order.created_at,
      items: Array.isArray(orderItems) ? orderItems : [],
    };

    console.log("📋 Formatted response:", {
      id: response.id,
      customer_name: response.customer_name,
      status: response.status,
      total_amount: response.total_amount,
      items_count: response.items.length,
    });

    return NextResponse.json({
      success: true,
      order: response,
    });
  } catch (error) {
    console.error("❌ Critical error in order fetch:", error);

    // Log detailed error information
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
