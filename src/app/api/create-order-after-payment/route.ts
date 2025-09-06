import { NextRequest, NextResponse } from "next/server";
import { OrderService } from "@/services/orders";
import { sendOrderEmails, formatOrderForEmail } from "@/services/emailService";

export async function POST(request: NextRequest) {
  try {
    console.log("🔄 Creating order after payment...");
    
    const body = await request.json();
    const { customerData, items, total, orderId } = body;

    if (!customerData || !items || !total || !orderId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create order data
    const orderData = {
      customer_name: customerData.name || "Customer",
      customer_email: customerData.email || "customer@example.com",
      customer_phone: customerData.phone || "+380000000000",
      city: customerData.city || "Київ",
      branch: customerData.warehouse || customerData.address || "Відділення №1",
      payment_method: "online",
      total_amount: total,
      items: items.map((item: any) => ({
        product_name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      status: "paid",
      payment_status: "success",
      payment_id: orderId,
    };

    console.log("🔄 Creating order with data:", orderData);

    // Create order in Supabase
    const order = await OrderService.createOrder(orderData);
    console.log(`✅ Order created successfully: ${order.id}`);

    // Send confirmation emails
    try {
      const emailOrder = formatOrderForEmail(order);
      const emailResult = await sendOrderEmails(emailOrder);
      console.log(`📧 Emails sent:`, emailResult);
    } catch (emailError) {
      console.error("⚠️ Email sending failed (non-critical):", emailError);
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      message: "Order created and emails sent successfully",
    });
  } catch (error) {
    console.error("❌ Error creating order after payment:", error);
    return NextResponse.json(
      { error: "Failed to create order after payment" },
      { status: 500 }
    );
  }
}
