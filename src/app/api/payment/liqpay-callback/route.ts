import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sendOrderEmails, formatOrderForEmail } from "@/services/emailService";
import { getProductUUID, isValidUUID } from "@/lib/uuid";
import { validateProductExists } from "@/services/productMapping";

const LIQPAY_PRIVATE_KEY =
  process.env.LIQPAY_PRIVATE_KEY ||
  "sandbox_i4PTRrU9ZfD0KCglN0QwJLfcJmbkoj1OJaHnRuWg";

interface LiqPayCallbackData {
  data: string;
  signature: string;
}

interface LiqPayPaymentData {
  version: number;
  public_key: string;
  action: string;
  amount: number;
  currency: string;
  description: string;
  order_id: string;
  status: string;
  transaction_id: string;
  sender_phone: string;
  sender_card_mask2: string;
  sender_card_bank: string;
  sender_card_type: string;
  sender_card_country: string;
  ip: string;
  agent: string;
  type: string;
  paytype: string;
  public_key: string;
  acq_id: string;
  liqpay_order_id: string;
  liqpay_payment_id: string;
  payment_id: string;
  create_date: number;
  end_date: number;
  transaction_id: string;
}

export async function POST(request: NextRequest) {
  try {
    console.log("🔄 Received LiqPay callback...");
    console.log("📝 Request URL:", request.url);
    console.log("📝 Request method:", request.method);

    const formData = await request.formData();
    const data = formData.get("data") as string;
    const signature = formData.get("signature") as string;

    console.log("📝 Form data received:", {
      hasData: !!data,
      hasSignature: !!signature,
      dataLength: data?.length || 0
    });

    if (!data || !signature) {
      console.error("❌ Missing data or signature in callback");
      return NextResponse.json(
        { error: "Missing data or signature" },
        { status: 400 }
      );
    }

    // Verify signature
    const expectedSignature = crypto
      .createHash("sha1")
      .update(LIQPAY_PRIVATE_KEY + data + LIQPAY_PRIVATE_KEY)
      .digest("base64");

    if (signature !== expectedSignature) {
      console.error("❌ Invalid signature in LiqPay callback");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Parse payment data
    const paymentData: LiqPayPaymentData = JSON.parse(
      Buffer.from(data, "base64").toString()
    );

    console.log("📝 Payment data:", {
      order_id: paymentData.order_id,
      status: paymentData.status,
      amount: paymentData.amount,
    });

    // Check if payment was successful
    if (paymentData.status !== "success") {
      console.log(
        `⚠️ Payment failed for order ${paymentData.order_id}: ${paymentData.status}`
      );
      return NextResponse.json({ error: "Payment failed" }, { status: 400 });
    }

    // Get payment session data
    console.log("🔍 Looking for payment session with order_id:", paymentData.order_id);
    const { data: sessionData, error: sessionError } = await supabaseAdmin
      .from("payment_sessions")
      .select("*")
      .eq("order_id", paymentData.order_id)
      .single();

    console.log("📊 Session query result:", {
      hasData: !!sessionData,
      error: sessionError,
      orderId: paymentData.order_id
    });

    if (sessionError || !sessionData) {
      console.error("❌ Payment session not found:", sessionError);
      console.error("❌ Order ID searched:", paymentData.order_id);
      console.error("❌ This should not happen if payment_sessions table exists");
      
      // Only use fallback if session really doesn't exist
      if (sessionError?.code === 'PGRST116') { // No rows found
        console.log("🔄 No payment session found, using fallback...");
        
        // Create a basic order structure
        const fallbackOrderData = {
          id: paymentData.order_id,
          customer_name: "Unknown Customer",
          customer_email: "unknown@example.com",
          customer_phone: "",
          city: "Unknown",
          branch: "Unknown",
          payment_method: "online",
          total_amount: paymentData.amount * 100, // Convert from UAH to kopecks
          status: "paid",
          payment_status: "success",
        };

        const { data: orderData, error: orderError } = await supabaseAdmin
          .from("orders")
          .insert([fallbackOrderData])
          .select()
          .single();

        if (orderError) {
          console.error("❌ Error creating fallback order:", orderError);
          return NextResponse.json(
            { error: "Failed to create order" },
            { status: 500 }
          );
        }

        console.log(`✅ Fallback order created: ${orderData.id}`);

        // Create a basic order item
        const fallbackOrderItem = {
          order_id: orderData.id,
          product_id: "00000000-0000-0000-0000-000000000000", // Default UUID
          product_name: "Unknown Product",
          product_price: paymentData.amount * 100,
          quantity: 1,
          price: paymentData.amount * 100,
        };

        const { error: itemError } = await supabaseAdmin
          .from("order_items")
          .insert([fallbackOrderItem]);

        if (itemError) {
          console.error("⚠️ Error creating fallback order item:", itemError);
        } else {
          console.log("✅ Fallback order item created");
        }

        return NextResponse.json({
          success: true,
          orderId: orderData.id,
          message: "Order created without session data",
        });
      } else {
        // Table doesn't exist or other error
        return NextResponse.json(
          { error: "Payment session not found", details: sessionError?.message },
          { status: 404 }
        );
      }
    }

    console.log("✅ Payment session found, proceeding with order creation...");
    console.log("📋 Session data:", {
      order_id: sessionData.order_id,
      customer_name: sessionData.customer_data?.name,
      total_amount: sessionData.total_amount,
      items_count: sessionData.items?.length || 0
    });

    // Check if order already exists
    const { data: existingOrder } = await supabaseAdmin
      .from("orders")
      .select("id")
      .eq("id", paymentData.order_id)
      .single();

    if (existingOrder) {
      console.log("⚠️ Order already exists, skipping creation");
      return NextResponse.json({
        success: true,
        message: "Order already exists",
      });
    }

    // Create order in database
    console.log("🔄 Creating order from payment session...");
    console.log("📋 Order data to insert:", {
      id: paymentData.order_id,
      customer_name: sessionData.customer_data.name,
      customer_email: sessionData.customer_data.email,
      total_amount: sessionData.total_amount,
      payment_method: "online"
    });

    const { data: orderData, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert([
        {
          id: paymentData.order_id,
          customer_name: sessionData.customer_data.name,
          customer_email: sessionData.customer_data.email,
          customer_phone: sessionData.customer_data.phone,
          city: sessionData.customer_data.city,
          branch: sessionData.customer_data.branch,
          payment_method: "online",
          total_amount: sessionData.total_amount,
          status: "paid",
          payment_status: "success",
        },
      ])
      .select()
      .single();

    console.log("📊 Order creation result:", {
      hasData: !!orderData,
      error: orderError,
      orderId: orderData?.id
    });

    if (orderError) {
      console.error("❌ Error creating order:", orderError);
      return NextResponse.json(
        { error: "Failed to create order" },
        { status: 500 }
      );
    }

    console.log(`✅ Order created: ${orderData.id}`);

    // Create order items
    console.log("🔄 Creating order items...");

    const orderItems = [];
    for (const item of sessionData.items) {
      const productUUID = getProductUUID(item);

      // Validate product exists
      const productExists = await validateProductExists(productUUID);
      if (!productExists) {
        console.error(`❌ Product ${item.id} does not exist in database`);
        continue;
      }

      orderItems.push({
        order_id: paymentData.order_id,
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
        { error: "Failed to create order items" },
        { status: 500 }
      );
    }

    console.log(`✅ Order items created: ${orderItems.length} items`);

    // Send confirmation email
    try {
      console.log("📧 Sending confirmation email...");

      // Fetch product images for email
      const itemsWithImages = await Promise.all(
        sessionData.items.map(async (item) => {
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
      console.log("✅ Confirmation email sent");
    } catch (emailError) {
      console.error("⚠️ Email sending failed (non-critical):", emailError);
    }

    // Update payment session status
    await supabaseAdmin
      .from("payment_sessions")
      .update({ status: "completed" })
      .eq("order_id", paymentData.order_id);

    // Create cart clearing event
    try {
      await supabaseAdmin.from("cart_clearing_events").insert({
        order_id: paymentData.order_id,
        created_at: new Date().toISOString(),
      });
      console.log("🧹 Cart clearing event created");
    } catch (clearError) {
      console.error("⚠️ Error creating cart clearing event:", clearError);
    }

    console.log(
      `✅ Payment callback processed successfully for order ${paymentData.order_id}`
    );

    return NextResponse.json({
      success: true,
      orderId: paymentData.order_id,
      message: "Order created successfully",
    });
  } catch (error) {
    console.error("❌ Error processing LiqPay callback:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
