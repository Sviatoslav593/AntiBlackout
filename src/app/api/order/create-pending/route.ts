import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getProductUUID } from "@/lib/uuid";
import { validateProductExists } from "@/services/productMapping";

export async function POST(request: NextRequest) {
  try {
    console.log("🔄 Creating pending order...");

    const body = await request.json();
    const { orderId, customerData, items, totalAmount } = body;

    if (!orderId || !customerData || !items || !totalAmount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log("📋 Creating pending order:", {
      orderId,
      customerName: customerData.name,
      totalAmount,
      itemsCount: items.length,
    });

    console.log("📋 Full request body:", JSON.stringify(body, null, 2));
    console.log("📋 Customer data:", JSON.stringify(customerData, null, 2));
    console.log("📋 Items:", JSON.stringify(items, null, 2));

    // Create order with pending status
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
          status: "pending_payment",
          payment_status: "pending",
        },
      ])
      .select()
      .single();

    if (orderError) {
      console.error("❌ Error creating pending order:", orderError);
      console.error("❌ Order data that failed:", {
        id: orderId,
        customer_name: customerData.name,
        customer_email: customerData.email,
        total_amount: totalAmount,
      });
      return NextResponse.json(
        { 
          error: "Failed to create pending order",
          details: orderError.message,
          code: orderError.code,
          hint: orderError.hint
        },
        { status: 500 }
      );
    }

    console.log("✅ Pending order created:", orderData.id);

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

    return NextResponse.json({
      success: true,
      orderId: orderData.id,
      message: "Pending order created successfully",
    });
  } catch (error) {
    console.error("❌ Error creating pending order:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
