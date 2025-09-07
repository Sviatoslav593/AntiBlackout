import { NextRequest, NextResponse } from "next/server";
import { sendOrderEmails, formatOrderForEmail } from "@/services/emailService";
import { createServerSupabaseClient } from "@/lib/supabase";

interface CreateOrderRequest {
  customerData: {
    name: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    address: string;
    paymentMethod: string;
    city: string;
    warehouse: string;
  };
  items: Array<{
    id: number;
    name: string;
    price: number;
    quantity: number;
    image?: string;
  }>;
  totalAmount: number;
}

export async function POST(request: NextRequest) {
  try {
    console.log("🛒 Starting order creation process...");

    // Parse request body with detailed logging
    let body: CreateOrderRequest;
    try {
      body = await request.json();
      console.log("📝 Raw request body received:", JSON.stringify(body, null, 2));
    } catch (parseError) {
      console.error("❌ Failed to parse request body:", parseError);
      return NextResponse.json(
        { 
          error: "Invalid JSON in request body",
          details: parseError instanceof Error ? parseError.message : "Unknown parsing error"
        },
        { status: 400 }
      );
    }

    const { customerData, items, totalAmount } = body;

    console.log("📝 Order creation request data:", {
      customerName: customerData?.name,
      customerEmail: customerData?.email,
      paymentMethod: customerData?.paymentMethod,
      totalAmount,
      itemCount: items?.length || 0,
    });

    // Validate required fields
    if (!customerData || !customerData.name || !customerData.email || !items || !items.length) {
      console.error("❌ Validation failed: Missing required fields", {
        hasCustomerData: !!customerData,
        hasName: !!customerData?.name,
        hasEmail: !!customerData?.email,
        hasItems: !!items,
        itemsLength: items?.length || 0,
      });
      return NextResponse.json(
        { 
          error: "Missing required fields", 
          details: "Name, email, and items are required",
          missing: {
            name: !customerData?.name,
            email: !customerData?.email,
            items: !items || items.length === 0
          }
        },
        { status: 400 }
      );
    }

    // Validate environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log("🔧 Environment variables check:", {
      supabaseUrl: supabaseUrl ? "✅ Set" : "❌ Missing",
      supabaseServiceKey: supabaseServiceKey ? "✅ Set" : "❌ Missing",
    });

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("❌ Missing Supabase environment variables");
      return NextResponse.json(
        { 
          error: "Server configuration error",
          details: "Missing required environment variables for database connection"
        },
        { status: 500 }
      );
    }

    console.log("✅ Environment variables validated");

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
          details: clientError instanceof Error ? clientError.message : "Unknown client error"
        },
        { status: 500 }
      );
    }

    // Prepare order data for Supabase (matching actual schema)
    const orderData = {
      customer_name: customerData.name,
      customer_email: customerData.email,
      customer_phone: customerData.phone || null,
      city: customerData.city || "",
      branch: customerData.warehouse || "",
      payment_method: customerData.paymentMethod === "liqpay" ? "online" : "cod",
      total_amount: totalAmount,
      status: "pending" as const,
    };

    console.log("📦 Prepared order data for database:", {
      customer_name: orderData.customer_name,
      customer_email: orderData.customer_email,
      payment_method: orderData.payment_method,
      total_amount: orderData.total_amount,
      status: orderData.status,
    });

    // Create order in Supabase
    console.log("💾 Creating order in Supabase...");
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert(orderData)
      .select()
      .single();

    if (orderError) {
      console.error("❌ Error creating order in database:", orderError);
      return NextResponse.json(
        { 
          error: "Failed to create order",
          details: orderError.message,
          code: orderError.code,
          hint: orderError.hint
        },
        { status: 500 }
      );
    }

    if (!order) {
      console.error("❌ Order creation returned null data");
      return NextResponse.json(
        { 
          error: "Order creation failed",
          details: "No order data returned from database"
        },
        { status: 500 }
      );
    }

    console.log(`✅ Order created successfully with ID: ${order.id}`);

    // Create order items
    console.log("📦 Creating order items...");
    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.id ? item.id.toString() : null,
      quantity: item.quantity,
      price: item.price * item.quantity,
    }));

    console.log("📦 Order items data:", orderItems);

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("❌ Error creating order items:", itemsError);
      // Don't fail the entire request, but log the error
      console.warn("⚠️ Order created but items failed to save");
    } else {
      console.log("✅ Order items created successfully");
    }

    // Handle different payment methods
    if (customerData.paymentMethod === "cod") {
      // For COD, immediately mark as paid and send email
      console.log("💰 Processing COD order - marking as paid and sending email");

      try {
        // Update order status to paid
        const { error: updateError } = await supabase
          .from("orders")
          .update({
            status: "confirmed",
            updated_at: new Date().toISOString(),
          })
          .eq("id", order.id);

        if (updateError) {
          console.error("❌ Error updating COD order status:", updateError);
          return NextResponse.json(
            {
              error: "Failed to update order status",
              details: updateError.message,
            },
            { status: 500 }
          );
        }

        console.log("✅ COD order status updated to confirmed");

        // Send confirmation email for COD
        try {
          console.log("📧 Sending COD confirmation emails...");
          const emailOrder = formatOrderForEmail({
            ...order,
            items: orderItems.map((item, index) => ({
              product_name: items[index]?.name || "Unknown Product",
              quantity: item.quantity,
              price: item.price,
            })),
          });
          await sendOrderEmails(emailOrder);
          console.log(`✅ COD confirmation emails sent for order ${order.id}`);
        } catch (emailError) {
          console.error("⚠️ Email sending failed (non-critical):", emailError);
          // Don't fail the request if email fails
        }

        return NextResponse.json({
          success: true,
          orderId: order.id,
          paymentMethod: "cod",
          status: "confirmed",
          message: "Order created and confirmed for COD",
          order: order,
        });
      } catch (codError) {
        console.error("❌ Error processing COD order:", codError);
        return NextResponse.json(
          {
            error: "Failed to process COD order",
            details: codError instanceof Error ? codError.message : "Unknown error",
          },
          { status: 500 }
        );
      }
    } else if (customerData.paymentMethod === "liqpay") {
      // For LiqPay, keep as pending and return order data for payment
      console.log("💳 Processing LiqPay order - keeping as pending for payment");

      return NextResponse.json({
        success: true,
        orderId: order.id,
        paymentMethod: "liqpay",
        status: "pending",
        message: "Order created, ready for LiqPay payment",
        order: order,
      });
    } else {
      console.error("❌ Invalid payment method:", customerData.paymentMethod);
      return NextResponse.json(
        { 
          error: "Invalid payment method",
          details: `Payment method '${customerData.paymentMethod}' is not supported`
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("❌ Critical error in order creation:", error);

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
