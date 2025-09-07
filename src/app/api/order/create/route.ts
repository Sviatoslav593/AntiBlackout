import { NextRequest, NextResponse } from "next/server";
import { sendOrderEmails, formatOrderForEmail } from "@/services/emailService";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getProductUUID, isValidUUID } from "@/lib/uuid";
import { validateProductExists } from "@/services/productMapping";

interface CreateOrderRequest {
  customerData: {
    name: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    paymentMethod: string;
    city: string;
    branch: string;
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
      branch: customerData.branch || "",
      payment_method:
        customerData.paymentMethod === "online" ? "online" : "cod",
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
    const paymentMethod = customerData.paymentMethod || "cod";
    const normalizedPM = paymentMethod === "online" ? "online" : "cod";
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
          city: customerData.city ?? null,
          branch: customerData.branch ?? null,
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

    // 2) Validate and prepare order items
    console.log("🔍 Validating product IDs before inserting order items...");

    const itemsInsert = [];
    for (const item of items) {
      // Convert numeric ID to UUID if needed
      const productUUID = getProductUUID(item);

      console.log(
        `🔄 Converting product ID ${item.id} to UUID: ${productUUID}`
      );

      // Validate that the product exists in the database
      const productExists = await validateProductExists(productUUID);

      if (!productExists) {
        console.error(
          `❌ Product with ID ${productUUID} does not exist in database`
        );
        return NextResponse.json(
          {
            error: "Invalid product",
            details: `Product with ID ${item.id} does not exist in database`,
          },
          { status: 400 }
        );
      }

      console.log(`✅ Product ${item.id} validated successfully`);

      itemsInsert.push({
        order_id: orderData.id,
        product_id: productUUID,
        product_name: item.name,
        price: item.price, // if "price" column exists
        product_price: item.price, // if only "product_price" exists
        quantity: item.quantity,
      });
    }

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
          // Fetch product images for email
          const itemsWithImages = await Promise.all(
            items.map(async (item) => {
              const productUUID = getProductUUID(item);
              const { data: product } = await supabaseAdmin
                .from("products")
                .select("image_url")
                .eq("id", productUUID)
                .single();

              return {
                product_name: item.name,
                quantity: item.quantity,
                price: item.price,
                image_url: product?.image_url || null,
              };
            })
          );

          const emailOrder = formatOrderForEmail({
            ...orderData,
            order_items: itemsWithImages,
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
      // For online payment, send email and clear cart immediately, then return order data for payment
      console.log(
        "💳 Processing online order - sending email and clearing cart immediately"
      );

      try {
        // Send confirmation email for online order
        console.log("📧 Sending online order confirmation emails...");
        // Fetch product images for email (same structure as COD)
        const itemsWithImages = await Promise.all(
          items.map(async (item) => {
            try {
              const productUUID = getProductUUID(item);
              const { data: productData } = await supabaseAdmin
                .from("products")
                .select("image_url")
                .eq("id", productUUID)
                .single();

              return {
                product_name: item.name,
                quantity: item.quantity,
                price: item.price,
                image_url: productData?.image_url || null,
              };
            } catch (error) {
              console.error(
                `❌ Error fetching image for product ${item.id}:`,
                error
              );
              return {
                product_name: item.name,
                quantity: item.quantity,
                price: item.price,
                image_url: null,
              };
            }
          })
        );

        // Create order object for email using the same format as COD
        const orderDataForEmail = {
          ...orderData,
          order_items: itemsWithImages,
        };

        console.log(
          "📧 Order data for email formatting:",
          JSON.stringify(orderDataForEmail, null, 2)
        );

        const emailOrder = formatOrderForEmail(orderDataForEmail);

        console.log(
          "📧 Sending email with order data:",
          JSON.stringify(emailOrder, null, 2)
        );

        const emailResult = await sendOrderEmails(emailOrder);
        console.log("📧 Email sending result:", emailResult);

        if (emailResult.customerEmail.success) {
          console.log("✅ Online order confirmation emails sent successfully");
        } else {
          console.error(
            "❌ Customer email failed:",
            emailResult.customerEmail.error
          );
        }

        if (emailResult.adminEmail.success) {
          console.log("✅ Admin email sent successfully");
        } else {
          console.error("❌ Admin email failed:", emailResult.adminEmail.error);
        }

        // Create cart clearing event
        console.log("🧹 Creating cart clearing event for online order...");
        const { error: cartError } = await supabaseAdmin
          .from("cart_clearing_events")
          .insert([
            {
              order_id: orderData.id,
              cleared_at: new Date().toISOString(),
            },
          ]);

        if (cartError) {
          console.error("❌ Error creating cart clearing event:", cartError);
        } else {
          console.log("✅ Cart clearing event created for online order");
        }
      } catch (onlineError) {
        console.error("❌ Error processing online order:", onlineError);
        // Don't fail the request if email/cart clearing fails
      }

      return NextResponse.json({
        success: true,
        orderId: orderData.id,
        paymentMethod: "online",
        status: "pending",
        message:
          "Order created, email sent, cart cleared, ready for online payment",
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
