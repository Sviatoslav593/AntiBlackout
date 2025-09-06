import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";
import { OrderService } from "@/services/orders";
import { sendOrderEmails, formatOrderForEmail } from "@/services/emailService";

export async function POST(request: NextRequest) {
  try {
    console.log("🧪 Testing callback functionality...");
    
    // Test order data
    const testOrderData = {
      customer_name: "Test Customer",
      customer_email: "test@example.com",
      customer_phone: "+380000000000",
      city: "Київ",
      branch: "Відділення №1",
      payment_method: "online",
      total_amount: 1000,
      items: [
        {
          product_name: "Test Product",
          quantity: 1,
          price: 1000,
        }
      ],
      status: "paid",
      payment_status: "success",
      payment_id: "test-payment-123",
    };

    console.log("🧪 Creating test order...");
    
    // Create order in Supabase
    const order = await OrderService.createOrder(testOrderData);
    console.log(`✅ Test order created: ${order.id}`);

    // Send confirmation emails
    try {
      const emailOrder = formatOrderForEmail(order);
      await sendOrderEmails(emailOrder);
      console.log(`📧 Test emails sent for order ${order.id}`);
    } catch (emailError) {
      console.error("⚠️ Test email sending failed:", emailError);
    }

    return NextResponse.json({
      success: true,
      message: "Test callback completed",
      orderId: order.id,
    });
  } catch (error) {
    console.error("❌ Test callback error:", error);
    return NextResponse.json(
      { error: "Test callback failed" },
      { status: 500 }
    );
  }
}
