import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: NextRequest) {
  try {
    console.log("🧪 Testing pending order creation...");
    
    const body = await request.json();
    const { orderId, customerData, items, totalAmount } = body;

    console.log("📋 Test data:", {
      orderId,
      customerName: customerData?.name,
      totalAmount,
      itemsCount: items?.length,
    });

    // Test order creation
    const testOrderId = `test_${Date.now()}`;
    
    const { data: orderData, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert([
        {
          id: testOrderId,
          customer_name: customerData?.name || "Test Customer",
          customer_email: customerData?.email || "test@example.com",
          customer_phone: customerData?.phone || "+380123456789",
          city: customerData?.city || "Test City",
          branch: customerData?.branch || "Test Branch",
          payment_method: "online",
          total_amount: totalAmount || 1000,
          status: "pending_payment",
          payment_status: "pending",
        },
      ])
      .select()
      .single();

    if (orderError) {
      console.error("❌ Error creating test order:", orderError);
      return NextResponse.json({
        success: false,
        error: "Failed to create test order",
        details: orderError.message,
        code: orderError.code,
        hint: orderError.hint
      }, { status: 500 });
    }

    console.log("✅ Test order created:", orderData.id);

    // Clean up test order
    await supabaseAdmin
      .from("orders")
      .delete()
      .eq("id", testOrderId);

    console.log("🧹 Test order cleaned up");

    return NextResponse.json({
      success: true,
      message: "Test order creation successful",
      testOrderId: orderData.id,
      orderData: orderData
    });

  } catch (error) {
    console.error("❌ Test pending order error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
