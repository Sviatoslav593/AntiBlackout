import { NextRequest, NextResponse } from "next/server";
import { sendOrderEmails, formatOrderForEmail } from "@/services/emailService";
import { createCodOrder, createOnlineOrder, normalizePaymentMethod } from "@/lib/db/orders";

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
      console.log(
        "📝 Raw request body received:",
        JSON.stringify(body, null, 2)
      );
    } catch (parseError) {
      console.error("❌ Failed to parse request body:", parseError);
      return NextResponse.json(
        {
          error: "Invalid JSON in request body",
          details:
            parseError instanceof Error
              ? parseError.message
              : "Unknown parsing error",
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
    if (
      !customerData ||
      !customerData.name ||
      !customerData.email ||
      !items ||
      !items.length
    ) {
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
            items: !items || items.length === 0,
          },
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
          details:
            "Missing required environment variables for database connection",
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
          details:
            clientError instanceof Error
              ? clientError.message
              : "Unknown client error",
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
      payment_method:
        customerData.paymentMethod === "liqpay" ? "online" : "cod",
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

    // Normalize payment method
    const paymentMethod = normalizePaymentMethod(customerData.paymentMethod);
    console.log(`💾 Creating ${paymentMethod} order in Supabase...`);

    // Prepare order data
    const orderPayload = {
      customer_name: customerData.name,
      customer_email: customerData.email,
      customer_phone: customerData.phone,
      customer_address: customerData.address,
      customer_city: customerData.city,
      items: items.map((item) => ({
        product_id: item.id ? item.id.toString() : undefined,
        product_name: item.name,
        price: item.price, // Unit price
        quantity: item.quantity,
      })),
      total_amount: totalAmount,
    };

    // Create order using data-access layer
    const { order, error: orderError } = paymentMethod === "cod" 
      ? await createCodOrder(orderPayload)
      : await createOnlineOrder(orderPayload);

    if (orderError || !order) {
      console.error("❌ Error creating order in database:", orderError);
      return NextResponse.json(
        {
          error: "Failed to create order",
          details: orderError?.message || "Unknown error",
        },
        { status: 500 }
      );
    }

    console.log(`✅ Order created successfully with ID: ${order.id}`);

    // Handle different payment methods
    if (paymentMethod === "cod") {
      // For COD, immediately mark as confirmed and send email
      console.log("💰 Processing COD order - marking as confirmed and sending email");

      try {
        // Update order status to confirmed
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
            items: orderPayload.items.map((item) => ({
              product_name: item.product_name,
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
            details:
              codError instanceof Error ? codError.message : "Unknown error",
          },
          { status: 500 }
        );
      }
    } else if (paymentMethod === "online") {
      // For online payment, keep as pending and return order data for payment
      console.log("💳 Processing online order - keeping as pending for payment");

      return NextResponse.json({
        success: true,
        orderId: order.id,
        paymentMethod: "online",
        status: "pending",
        message: "Order created, ready for online payment",
        order: order,
      });
    } else {
      console.error("❌ Invalid payment method:", customerData.paymentMethod);
      return NextResponse.json(
        {
          error: "Invalid payment method",
          details: `Payment method '${customerData.paymentMethod}' is not supported`,
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
