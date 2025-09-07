import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sendOrderEmails, formatOrderForEmail } from "@/services/emailService";
import { getProductUUID, isValidUUID } from "@/lib/uuid";
import { validateProductExists } from "@/services/productMapping";

interface FinalizeOrderRequest {
  orderId: string;
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
    console.log("🔄 Starting order finalization process...");

    const body: FinalizeOrderRequest = await request.json();
    const { orderId, customerData, items, totalAmount } = body;

    console.log("📝 Finalization request data:", {
      orderId,
      customerName: customerData?.name,
      customerEmail: customerData?.email,
      paymentMethod: customerData?.paymentMethod,
      totalAmount,
      itemCount: items?.length || 0,
    });

    // Validate required fields
    if (!orderId || !customerData || !items || !items.length) {
      console.error("❌ Validation failed: Missing required fields");
      return NextResponse.json(
        {
          error: "Missing required fields",
          details: "orderId, customerData, and items are required",
        },
        { status: 400 }
      );
    }

    // Check if order already exists
    const { data: existingOrder, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderError && orderError.code !== "PGRST116") {
      console.error("❌ Error checking existing order:", orderError);
      return NextResponse.json(
        {
          error: "Database error",
          details: "Failed to check existing order",
        },
        { status: 500 }
      );
    }

    let order;

    if (existingOrder) {
      // Update existing order
      console.log("🔄 Updating existing order:", orderId);

      const { data: updatedOrder, error: updateError } = await supabaseAdmin
        .from("orders")
        .update({
          customer_name: customerData.name,
          customer_email: customerData.email,
          customer_phone: customerData.phone || null,
          city: customerData.city || "",
          branch: customerData.branch || "",
          payment_method:
            customerData.paymentMethod === "liqpay" ? "online" : "cod",
          total_amount: totalAmount,
          status: "paid",
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)
        .select()
        .single();

      if (updateError) {
        console.error("❌ Error updating order:", updateError);
        return NextResponse.json(
          {
            error: "Failed to update order",
            details: updateError.message,
          },
          { status: 500 }
        );
      }

      order = updatedOrder;
    } else {
      // Create new order
      console.log("🔄 Creating new order:", orderId);

      const { data: newOrder, error: createError } = await supabaseAdmin
        .from("orders")
        .insert({
          id: orderId,
          customer_name: customerData.name,
          customer_email: customerData.email,
          customer_phone: customerData.phone || null,
          city: customerData.city || "",
          branch: customerData.branch || "",
          payment_method:
            customerData.paymentMethod === "liqpay" ? "online" : "cod",
          total_amount: totalAmount,
          status: "paid",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (createError) {
        console.error("❌ Error creating order:", createError);
        return NextResponse.json(
          {
            error: "Failed to create order",
            details: createError.message,
          },
          { status: 500 }
        );
      }

      order = newOrder;
    }

    // Create or update order items
    console.log("🔄 Processing order items...");

    // First, delete existing items
    await supabaseAdmin.from("order_items").delete().eq("order_id", orderId);

    // Validate and prepare order items
    console.log("🔍 Validating product IDs before inserting order items...");

    const orderItems = [];
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

      orderItems.push({
        order_id: orderId,
        product_id: productUUID,
        product_name: item.name,
        product_price: item.price,
        quantity: item.quantity,
        price: item.price * item.quantity,
      });
    }

    const { error: itemsError } = await supabaseAdmin
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("❌ Error creating order items:", itemsError);
      return NextResponse.json(
        {
          error: "Failed to create order items",
          details: itemsError.message,
        },
        { status: 500 }
      );
    }

    console.log("✅ Order finalized successfully:", orderId);

    // Send confirmation emails
    try {
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
        ...order,
        order_items: itemsWithImages,
      });
      await sendOrderEmails(emailOrder);
      console.log(`📧 Confirmation emails sent for order ${orderId}`);
    } catch (emailError) {
      console.error("⚠️ Email sending failed (non-critical):", emailError);
    }

    // Create cart clearing event
    try {
      await supabaseAdmin.from("cart_clearing_events").insert({
        order_id: orderId,
        created_at: new Date().toISOString(),
      });
      console.log(`🧹 Cart clearing event created for order ${orderId}`);
    } catch (clearError) {
      console.error("⚠️ Error creating cart clearing event:", clearError);
    }

    return NextResponse.json({
      success: true,
      orderId: orderId,
      message: "Order finalized successfully",
      order: order,
    });
  } catch (error) {
    console.error("❌ Error finalizing order:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
