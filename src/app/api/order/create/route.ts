import { NextRequest, NextResponse } from "next/server";
import { sendOrderEmails, formatOrderForEmail } from "@/services/emailService";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

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

    // Use admin client for database operations
    console.log("✅ Using Supabase admin client for database operations");

    // Prepare order data for Supabase (matching actual schema)
    const orderPayload = {
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
      customer_name: orderPayload.customer_name,
      customer_email: orderPayload.customer_email,
      payment_method: orderPayload.payment_method,
      total_amount: orderPayload.total_amount,
      status: orderPayload.status,
    });

    // Normalize payment method
    const paymentMethod = (customerData.paymentMethod || "").toLowerCase();
    const normalizedPM =
      paymentMethod === "online" || paymentMethod === "card" ? "online" : "cod";
    console.log(`💾 Creating ${normalizedPM} order in Supabase...`);

    // Validate required fields
    if (!customerData.name || !customerData.email) {
      return NextResponse.json(
        { error: "Missing customer_name or customer_email" },
        { status: 400 }
      );
    }
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Items array is required" },
        { status: 400 }
      );
    }
    if (typeof totalAmount !== "number") {
      return NextResponse.json(
        { error: "total_amount must be a number" },
        { status: 400 }
      );
    }

    // 1) Create order
    const { data: orderData, error: orderErr } = await supabaseAdmin
      .from("orders")
      .insert([
        {
          customer_name: customerData.name,
          customer_email: customerData.email,
          customer_phone: customerData.phone ?? null,
          customer_address: customerData.address ?? null,
          customer_city: customerData.city ?? null,
          status: "pending",
          payment_method: normalizedPM,
          total_amount: totalAmount,
        },
      ])
      .select()
      .single();

    if (orderErr) {
      console.error("[/api/order/create] orders insert error:", orderErr);
      return NextResponse.json(
        { error: "Failed to create order", details: orderErr.message },
        { status: 500 }
      );
    }

    // 2) Insert order items (write to both price columns to be schema-compatible)
    const itemsInsert = items.map((item) => ({
      order_id: orderData.id,
      product_id: item.id ? item.id.toString() : null,
      product_name: item.name,
      price: item.price, // if "price" column exists
      product_price: item.price, // if only "product_price" exists
      quantity: item.quantity,
    }));

    const { error: itemsErr } = await supabaseAdmin
      .from("order_items")
      .insert(itemsInsert);

    if (itemsErr) {
      console.error("[/api/order/create] order_items insert error:", itemsErr);
      return NextResponse.json(
        { error: "Failed to create order items", details: itemsErr.message },
        { status: 500 }
      );
    }

    console.log(`✅ Order created successfully with ID: ${orderData.id}`);

    // Handle different payment methods
    if (normalizedPM === "cod") {
      // For COD, immediately mark as confirmed and send email
      console.log(
        "💰 Processing COD order - marking as confirmed and sending email"
      );

      try {
        // Update order status to confirmed
        const { error: updateError } = await supabaseAdmin
          .from("orders")
          .update({
            status: "confirmed",
            updated_at: new Date().toISOString(),
          })
          .eq("id", orderData.id);

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
            ...orderData,
            items: items.map((item) => ({
              product_name: item.name,
              quantity: item.quantity,
              price: item.price,
            })),
          });
          await sendOrderEmails(emailOrder);
          console.log(
            `✅ COD confirmation emails sent for order ${orderData.id}`
          );
        } catch (emailError) {
          console.error("⚠️ Email sending failed (non-critical):", emailError);
          // Don't fail the request if email fails
        }

        return NextResponse.json({
          success: true,
          orderId: orderData.id,
          paymentMethod: "cod",
          status: "confirmed",
          message: "Order created and confirmed for COD",
          order: orderData,
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
    } else if (normalizedPM === "online") {
      // For online payment, keep as pending and return order data for payment
      console.log(
        "💳 Processing online order - keeping as pending for payment"
      );

      return NextResponse.json({
        success: true,
        orderId: orderData.id,
        paymentMethod: "online",
        status: "pending",
        message: "Order created, ready for online payment",
        order: orderData,
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
