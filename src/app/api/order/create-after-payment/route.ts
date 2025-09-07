import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sendOrderEmails, formatOrderForEmail } from "@/services/emailService";
import { getProductUUID, isValidUUID } from "@/lib/uuid";
import { validateProductExists } from "@/services/productMapping";

export async function POST(request: NextRequest) {
  try {
    console.log("🔄 Creating order after successful payment...");
    
    const body = await request.json();
    const { orderId, customerData, items, totalAmount } = body;

    if (!orderId || !customerData || !items || !totalAmount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log("📋 Order data:", {
      orderId,
      customerName: customerData.name,
      totalAmount,
      itemsCount: items.length
    });

    // Check if order already exists
    const { data: existingOrder } = await supabaseAdmin
      .from("orders")
      .select("id, status")
      .eq("id", orderId)
      .single();

    if (existingOrder) {
      console.log("⚠️ Order already exists, updating status...");
      
      // Update order status to paid
      const { error: updateError } = await supabaseAdmin
        .from("orders")
        .update({
          status: "paid",
          payment_status: "success",
          updated_at: new Date().toISOString()
        })
        .eq("id", orderId);

      if (updateError) {
        console.error("❌ Error updating order:", updateError);
        return NextResponse.json(
          { error: "Failed to update order status" },
          { status: 500 }
        );
      }

      console.log("✅ Order status updated to paid");
    } else {
      // Create new order
      console.log("🔄 Creating new order...");
      
      const { data: orderData, error: orderError } = await supabaseAdmin
        .from("orders")
        .insert([
          {
            id: orderId,
            customer_name: customerData.name,
            customer_email: customerData.email,
            customer_phone: customerData.phone,
            city: customerData.city,
            branch: customerData.branch,
            payment_method: "online",
            total_amount: totalAmount,
            status: "paid",
            payment_status: "success",
          },
        ])
        .select()
        .single();

      if (orderError) {
        console.error("❌ Error creating order:", orderError);
        return NextResponse.json(
          { error: "Failed to create order" },
          { status: 500 }
        );
      }

      console.log("✅ Order created:", orderData.id);

      // Create order items
      console.log("🔄 Creating order items...");
      
      const orderItems = [];
      for (const item of items) {
        const productUUID = getProductUUID(item);

        // Validate product exists
        const productExists = await validateProductExists(productUUID);
        if (!productExists) {
          console.error(`❌ Product ${item.id} does not exist in database`);
          continue;
        }

        orderItems.push({
          order_id: orderId,
          product_id: productUUID,
          product_name: item.name,
          product_price: item.price,
          quantity: item.quantity,
          price: item.price * item.quantity,
        });
      }

      if (orderItems.length > 0) {
        const { error: itemsError } = await supabaseAdmin
          .from("order_items")
          .insert(orderItems);

        if (itemsError) {
          console.error("❌ Error creating order items:", itemsError);
          return NextResponse.json(
            { error: "Failed to create order items" },
            { status: 500 }
          );
        }

        console.log(`✅ Order items created: ${orderItems.length} items`);
      }
    }

    // Send confirmation email
    try {
      console.log("📧 Sending confirmation email...");

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

      // Get order data for email
      const { data: orderForEmail } = await supabaseAdmin
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();

      if (orderForEmail) {
        const emailOrder = formatOrderForEmail({
          ...orderForEmail,
          order_items: itemsWithImages,
        });

        await sendOrderEmails(emailOrder);
        console.log("✅ Confirmation email sent");
      }
    } catch (emailError) {
      console.error("⚠️ Email sending failed (non-critical):", emailError);
    }

    // Create cart clearing event
    try {
      await supabaseAdmin.from("cart_clearing_events").insert({
        order_id: orderId,
        created_at: new Date().toISOString(),
      });
      console.log("🧹 Cart clearing event created");
    } catch (clearError) {
      console.error("⚠️ Cart clearing event failed (non-critical):", clearError);
    }

    return NextResponse.json({
      success: true,
      orderId,
      message: "Order created and confirmed successfully",
    });

  } catch (error) {
    console.error("❌ Error in create-after-payment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
