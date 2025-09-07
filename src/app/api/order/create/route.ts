import { NextRequest, NextResponse } from "next/server";
import { OrderService } from "@/services/orders";
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
    
    const body: CreateOrderRequest = await request.json();
    const { customerData, items, totalAmount } = body;

    console.log("📝 Order creation request data:", {
      customerName: customerData.name,
      customerEmail: customerData.email,
      paymentMethod: customerData.paymentMethod,
      totalAmount,
      itemCount: items.length,
    });

    // Validate required fields
    if (!customerData.name || !customerData.email || !items.length) {
      console.error("❌ Validation failed: Missing required fields");
      return NextResponse.json(
        { error: "Missing required fields: name, email, items" },
        { status: 400 }
      );
    }

    // Validate environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("❌ Missing Supabase environment variables:", {
        supabaseUrl: supabaseUrl ? "✅ Set" : "❌ Missing",
        supabaseServiceKey: supabaseServiceKey ? "✅ Set" : "❌ Missing",
      });
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    console.log("✅ Environment variables validated");

    // Generate unique order ID
    const orderId = `AB-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    console.log("🆔 Generated order ID:", orderId);

    // Prepare order data for Supabase
    const orderData = {
      customer_name: customerData.name,
      customer_email: customerData.email,
      customer_phone: customerData.phone,
      city: customerData.city,
      branch: customerData.warehouse,
      payment_method:
        customerData.paymentMethod === "liqpay" ? "online" : "cod",
      total_amount: totalAmount,
      items: items.map((item) => ({
        product_id: item.id.toString(),
        product_name: item.name,
        product_price: item.price,
        quantity: item.quantity,
        price: item.price * item.quantity,
      })),
    };

    console.log("📦 Prepared order data:", {
      customer_name: orderData.customer_name,
      payment_method: orderData.payment_method,
      total_amount: orderData.total_amount,
      items_count: orderData.items.length,
    });

    // Create order in Supabase with pending status
    console.log("💾 Creating order in Supabase...");
    const order = await OrderService.createOrder(orderData);
    console.log(`✅ Order created successfully with ID: ${order.id}`);

    // Handle different payment methods
    if (customerData.paymentMethod === "cod") {
      // For COD, immediately mark as paid and send email
      console.log("💰 Processing COD order - marking as paid and sending email");

      try {
        // Update order status to paid
        const supabase = createServerSupabaseClient();
        const { error: updateError } = await supabase
          .from("orders")
          .update({
            status: "paid",
            payment_status: "paid",
            updated_at: new Date().toISOString(),
          })
          .eq("id", order.id);

        if (updateError) {
          console.error("❌ Error updating COD order status:", updateError);
          return NextResponse.json(
            { 
              error: "Failed to update order status",
              details: updateError.message 
            },
            { status: 500 }
          );
        }

        console.log("✅ COD order status updated to paid");

        // Send confirmation email for COD
        try {
          console.log("📧 Sending COD confirmation emails...");
          const emailOrder = formatOrderForEmail(order);
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
          status: "paid",
          message: "Order created and confirmed for COD",
          order: order,
        });
      } catch (codError) {
        console.error("❌ Error processing COD order:", codError);
        return NextResponse.json(
          { 
            error: "Failed to process COD order",
            details: codError instanceof Error ? codError.message : "Unknown error"
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
        { error: "Invalid payment method" },
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
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

