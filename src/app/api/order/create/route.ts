import { NextRequest, NextResponse } from "next/server";
import { OrderService } from "@/services/orders";
import { sendOrderEmails, formatOrderForEmail } from "@/services/emailService";

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
    const body: CreateOrderRequest = await request.json();
    const { customerData, items, totalAmount } = body;

    console.log("🛒 Creating order with data:", {
      customerName: customerData.name,
      paymentMethod: customerData.paymentMethod,
      totalAmount,
      itemCount: items.length,
    });

    // Validate required fields
    if (!customerData.name || !customerData.email || !items.length) {
      return NextResponse.json(
        { error: "Missing required fields: name, email, items" },
        { status: 400 }
      );
    }

    // Generate unique order ID
    const orderId = `AB-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Prepare order data for Supabase
    const orderData = {
      customer_name: customerData.name,
      customer_email: customerData.email,
      customer_phone: customerData.phone,
      city: customerData.city,
      branch: customerData.warehouse,
      payment_method: customerData.paymentMethod === "liqpay" ? "online" : "cod",
      total_amount: totalAmount,
      items: items.map((item) => ({
        product_id: item.id.toString(),
        product_name: item.name,
        product_price: item.price,
        quantity: item.quantity,
        price: item.price * item.quantity,
      })),
    };

    // Create order in Supabase with pending status
    const order = await OrderService.createOrder(orderData);
    console.log(`✅ Order created with ID: ${order.id}`);

    // Handle different payment methods
    if (customerData.paymentMethod === "cod") {
      // For COD, immediately mark as paid and send email
      console.log("💰 COD order - marking as paid and sending email");
      
      // Update order status to paid
      const supabase = createServerSupabaseClient();
      const { error: updateError } = await supabase
        .from("orders")
        .update({ 
          status: "paid",
          payment_status: "paid",
          updated_at: new Date().toISOString()
        })
        .eq("id", order.id);

      if (updateError) {
        console.error("❌ Error updating COD order status:", updateError);
        return NextResponse.json(
          { error: "Failed to update order status" },
          { status: 500 }
        );
      }

      // Send confirmation email for COD
      try {
        const emailOrder = formatOrderForEmail(order);
        await sendOrderEmails(emailOrder);
        console.log(`📧 COD confirmation emails sent for order ${order.id}`);
      } catch (emailError) {
        console.error("⚠️ Email sending failed (non-critical):", emailError);
      }

      return NextResponse.json({
        success: true,
        orderId: order.id,
        paymentMethod: "cod",
        status: "paid",
        message: "Order created and confirmed for COD",
        order: order,
      });
    } else if (customerData.paymentMethod === "liqpay") {
      // For LiqPay, keep as pending and return order data for payment
      console.log("💳 LiqPay order - keeping as pending for payment");
      
      return NextResponse.json({
        success: true,
        orderId: order.id,
        paymentMethod: "liqpay",
        status: "pending",
        message: "Order created, ready for LiqPay payment",
        order: order,
      });
    } else {
      return NextResponse.json(
        { error: "Invalid payment method" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("❌ Error creating order:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function createServerSupabaseClient() {
  const { createClient } = require("@supabase/supabase-js");
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables");
  }
  
  return createClient(supabaseUrl, supabaseKey);
}
