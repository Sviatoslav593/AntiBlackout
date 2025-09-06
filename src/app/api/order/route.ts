import { NextRequest, NextResponse } from "next/server";
import { OrderService } from "@/services/orders";
import {
  sendOrderConfirmationEmail,
  formatOrderForEmail,
} from "@/services/emailService";

interface OrderData {
  customer: {
    name: string;
    firstName?: string;
    lastName?: string;
    phone: string;
    email?: string;
    address: string;
    paymentMethod?: string;
    city?: string;
    cityRef?: string;
    warehouse?: string;
    warehouseRef?: string;
    customAddress?: string;
  };
  items: Array<{
    id: number;
    name: string;
    price: number;
    quantity: number;
  }>;
  total: number;
  itemCount: number;
  orderDate: string;
}

export async function POST(request: NextRequest) {
  try {
    const orderData: OrderData = await request.json();

    // Validate required fields
    if (
      !orderData.customer?.name ||
      !orderData.customer?.phone ||
      !orderData.customer?.address
    ) {
      return NextResponse.json(
        { error: "Missing required customer information" },
        { status: 400 }
      );
    }

    if (!orderData.items || orderData.items.length === 0) {
      return NextResponse.json({ error: "No items in order" }, { status: 400 });
    }

    // Prepare order data for Supabase
    const supabaseOrderData = {
      customer_name: orderData.customer.name,
      customer_email: orderData.customer.email,
      customer_phone: orderData.customer.phone,
      city: orderData.customer.city || "Не вказано",
      branch: orderData.customer.warehouse || orderData.customer.address,
      payment_method: orderData.customer.paymentMethod || "cash_on_delivery",
      total_amount: orderData.total,
      items: orderData.items.map((item) => ({
        product_id: null, // Don't reference products table for now
        product_name: item.name, // Store product name from cart data
        product_price: item.price, // Store product price from cart data
        quantity: item.quantity,
        price: item.price,
      })),
    };

    // Create order in Supabase
    const order = await OrderService.createOrder(supabaseOrderData);

    // Log order to console
    console.log("📦 New Order Received:");
    console.log("Order ID:", order.id);
    console.log("Customer:", order.customer_name, order.customer_phone);
    if (order.customer_email) {
      console.log("Email:", order.customer_email);
    }
    console.log("Address:", order.branch);
    console.log("Payment Method:", order.payment_method);
    console.log("City:", order.city);
    console.log("Items:", order.order_items.length);
    console.log("Total:", order.total_amount, "₴");
    console.log("Full Order:", JSON.stringify(order, null, 2));

    // Send confirmation email if customer has email
    if (order.customer_email) {
      try {
        console.log("📧 Sending confirmation email...");

        const emailOrder = formatOrderForEmail(order);
        const emailResult = await sendOrderConfirmationEmail(emailOrder);

        if (emailResult.success) {
          console.log("✅ Confirmation email sent successfully");
        } else {
          console.log(
            "⚠️ Failed to send confirmation email:",
            emailResult.error
          );
        }
      } catch (emailError) {
        console.log("⚠️ Email sending error (non-critical):", emailError);
        // Don't fail the order if email fails
      }
    } else {
      console.log("ℹ️ No email provided, skipping confirmation email");
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      message: "Замовлення успішно оформлено",
      estimatedDelivery: "1-2 робочих дні",
      emailSent: !!order.customer_email,
    });
  } catch (error) {
    console.error("Error processing order:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
