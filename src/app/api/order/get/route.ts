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

    // Fetch order details with items using LEFT JOIN
    console.log("💾 Fetching order with items from database...");
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .select(`
        id,
        customer_name,
        customer_email,
        customer_phone,
        city,
        branch,
        status,
        payment_method,
        total_amount,
        created_at,
        order_items (
          id,
          product_name,
          quantity,
          price
        )
      `)
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

    if (!orderData) {
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
      id: orderData.id,
      customer_name: orderData.customer_name,
      status: orderData.status,
      total_amount: orderData.total_amount,
      items_count: orderData.order_items?.length || 0,
    });

    // Format response - ensure items is always an array
    const response = {
      id: orderData.id,
      customer_name: orderData.customer_name,
      customer_email: orderData.customer_email,
      customer_phone: orderData.customer_phone,
      city: orderData.city,
      branch: orderData.branch,
      status: orderData.status,
      payment_method: orderData.payment_method,
      total_amount: orderData.total_amount,
      created_at: orderData.created_at,
      items: Array.isArray(orderData.order_items) ? orderData.order_items : [],
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
