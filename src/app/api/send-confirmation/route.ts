import { NextRequest, NextResponse } from "next/server";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface OrderData {
  id: string;
  status: string;
  total_price: number;
  items: OrderItem[];
}

interface CustomerData {
  email: string;
  name: string;
}

interface ConfirmationRequest {
  order: OrderData;
  customer: CustomerData;
}

export async function POST(request: NextRequest) {
  try {
    const { order, customer }: ConfirmationRequest = await request.json();

    // Validate required fields
    if (!order || !customer) {
      return NextResponse.json(
        { error: "Missing required fields: order and customer" },
        { status: 400 }
      );
    }

    if (!order.id || !order.total_price || !Array.isArray(order.items)) {
      return NextResponse.json(
        { error: "Invalid order data" },
        { status: 400 }
      );
    }

    if (!customer.email || !customer.name) {
      return NextResponse.json(
        { error: "Invalid customer data" },
        { status: 400 }
      );
    }

    // Call Supabase Edge Function
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: "Supabase configuration missing" },
        { status: 500 }
      );
    }

    const response = await fetch(
      `${supabaseUrl}/functions/v1/send-order-confirmation`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${supabaseAnonKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          order: {
            id: order.id,
            status: order.status || "pending",
            total_price: order.total_price,
            items: order.items.map((item) => ({
              name: item.name,
              quantity: item.quantity,
              price: item.price,
            })),
          },
          customer: {
            email: customer.email,
            name: customer.name,
          },
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error("Edge Function error:", result);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to send confirmation email",
          details: result.error || "Unknown error",
        },
        { status: response.status }
      );
    }

    console.log(`✅ Order confirmation email sent for order ${order.id}`);

    return NextResponse.json({
      success: true,
      message: "Order confirmation email sent successfully",
      orderId: order.id,
      customerEmail: customer.email,
    });
  } catch (error) {
    console.error("Error sending order confirmation:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
