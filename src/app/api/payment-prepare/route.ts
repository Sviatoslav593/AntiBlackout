import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createServerSupabaseClient } from "@/lib/supabase";
import { OrderService } from "@/services/orders";

interface PaymentPrepareRequest {
  amount: number;
  description: string;
  orderId: string;
  currency?: string;
  customerData: any;
  items: any[];
}

interface LiqPayData {
  public_key: string;
  version: number;
  action: string;
  amount: number;
  currency: string;
  description: string;
  order_id: string;
  result_url: string;
  server_url: string;
  language: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: PaymentPrepareRequest = await request.json();
    const {
      amount,
      description,
      orderId,
      currency = "UAH",
      customerData,
      items,
    } = body;

    // Validate required fields
    if (!amount || !description || !orderId || !customerData || !items) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: amount, description, orderId, customerData, items",
        },
        { status: 400 }
      );
    }

    // Get LiqPay keys from environment
    const publicKey = process.env.LIQPAY_PUBLIC_KEY;
    const privateKey = process.env.LIQPAY_PRIVATE_KEY;

    if (!publicKey || !privateKey) {
      console.error("❌ LiqPay keys not configured:", {
        publicKey: publicKey ? "✅ Set" : "❌ Missing",
        privateKey: privateKey ? "✅ Set" : "❌ Missing",
      });
      return NextResponse.json(
        {
          error:
            "Payment service not configured. Please check LIQPAY_PUBLIC_KEY and LIQPAY_PRIVATE_KEY environment variables.",
          details:
            "Missing LiqPay configuration. See LIQPAY_ENV_SETUP.md for setup instructions.",
        },
        { status: 500 }
      );
    }

    // Create order in database immediately with "pending" status
    try {
      const orderData = {
        customer_name: customerData.name || "Customer",
        customer_email: customerData.email || "customer@example.com",
        customer_phone: customerData.phone || "+380000000000",
        city: customerData.city || "Київ",
        branch: customerData.warehouse || customerData.address || "Відділення №1",
        payment_method: "online",
        total_amount: amount,
        items: items.map((item: any) => ({
          product_name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        status: "pending", // Will be updated to "paid" by callback
        payment_status: "pending",
        payment_id: null,
      };

      const order = await OrderService.createOrder(orderData);
      console.log(`✅ Order created with pending status: ${order.id}`);

      // Also store in pending_orders for callback processing
      const supabase = createServerSupabaseClient();
      const { error: insertError } = await supabase
        .from("pending_orders")
        .insert({
          id: orderId,
          customer_data: customerData,
          items: items,
          amount: amount,
          description: description,
          created_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error("❌ Error storing pending order:", insertError);
        // Continue anyway - this is not critical
      } else {
        console.log(`✅ Pending order stored: ${orderId}`);
      }
    } catch (error) {
      console.error("❌ Error creating order:", error);
      return NextResponse.json(
        { error: "Failed to create order" },
        { status: 500 }
      );
    }

    // Get site URL for callbacks
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "https://antiblackout.shop";

    // Prepare LiqPay data
    const liqpayData: LiqPayData = {
      public_key: publicKey,
      version: 3,
      action: "pay",
      amount: amount,
      currency: currency,
      description: description,
      order_id: orderId,
      result_url: `${siteUrl}/order-success?orderId=${orderId}`,
      server_url: `${siteUrl}/api/payment/callback`,
      language: "uk",
    };

    // Convert to JSON and encode to base64
    const dataString = JSON.stringify(liqpayData);
    const data = Buffer.from(dataString).toString("base64");

    // Generate signature: SHA1(privateKey + data + privateKey)
    const signatureString = privateKey + data + privateKey;
    const signature = crypto
      .createHash("sha1")
      .update(signatureString)
      .digest("base64");

    // Store order data temporarily (in production, use Redis or database)
    // For now, we'll pass it back to frontend to store in localStorage
    const orderData = {
      orderId,
      customerData,
      items,
      amount,
      description,
      paymentData: { data, signature },
      createdAt: new Date().toISOString(),
    };

    console.log(`💳 LiqPay payment data generated for order ${orderId}:`, {
      amount,
      currency,
      description,
      orderId,
    });

    return NextResponse.json({
      success: true,
      data,
      signature,
      orderId,
      orderData, // Temporary data for frontend
    });
  } catch (error) {
    console.error("❌ Error generating LiqPay payment data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
