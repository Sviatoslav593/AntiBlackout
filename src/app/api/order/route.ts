import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

interface OrderData {
  customer: {
    name: string;
    firstName?: string;
    lastName?: string;
    phone: string;
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

    // Generate unique order ID
    const orderId = `AB-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    const order = {
      id: orderId,
      ...orderData,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    // Log order to console
    console.log("📦 New Order Received:");
    console.log("Order ID:", orderId);
    console.log("Customer:", orderData.customer.name, orderData.customer.phone);
    if (orderData.customer.firstName && orderData.customer.lastName) {
      console.log("First Name:", orderData.customer.firstName);
      console.log("Last Name:", orderData.customer.lastName);
    }
    console.log("Address:", orderData.customer.address);
    console.log("Payment Method:", orderData.customer.paymentMethod);
    console.log("City:", orderData.customer.city);
    console.log("Warehouse:", orderData.customer.warehouse);
    console.log("Items:", orderData.items.length);
    console.log("Total:", orderData.total, "₴");
    console.log("Full Order:", JSON.stringify(order, null, 2));

    // Save order to temporary JSON file (in production, save to database)
    try {
      const ordersDir = path.join(process.cwd(), "orders");

      // Create orders directory if it doesn't exist
      if (!fs.existsSync(ordersDir)) {
        fs.mkdirSync(ordersDir, { recursive: true });
      }

      const orderFile = path.join(ordersDir, `${orderId}.json`);
      fs.writeFileSync(orderFile, JSON.stringify(order, null, 2));

      console.log("💾 Order saved to:", orderFile);
    } catch (fileError) {
      console.error("Failed to save order to file:", fileError);
      // Continue execution - don't fail the API call if file save fails
    }

    // In a real application, here you would:
    // 1. Save to database
    // 2. Send confirmation email
    // 3. Integrate with payment gateway
    // 4. Send to fulfillment system
    // 5. Send SMS notification

    return NextResponse.json({
      success: true,
      orderId,
      message: "Замовлення успішно оформлено",
      estimatedDelivery: "1-2 робочих дні",
    });
  } catch (error) {
    console.error("Error processing order:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
