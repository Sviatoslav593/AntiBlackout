import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(request: NextRequest) {
  try {
    console.log("🧪 Testing order items...");
    
    // Get the most recent order
    const { data: recentOrder, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("id, customer_name, payment_method, created_at")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (orderError || !recentOrder) {
      return NextResponse.json({
        error: "No orders found",
        success: false
      }, { status: 404 });
    }

    console.log("📋 Recent order:", recentOrder);

    // Get order items with product data
    const { data: itemsData, error: itemsError } = await supabaseAdmin
      .from("order_items")
      .select(`
        id, 
        product_name, 
        quantity, 
        price, 
        product_price,
        product_id,
        products:product_id (
          id,
          name,
          image_url
        )
      `)
      .eq("order_id", recentOrder.id)
      .order("created_at", { ascending: true });

    if (itemsError) {
      console.error("❌ Items error:", itemsError);
      return NextResponse.json({
        error: "Failed to fetch items",
        success: false,
        details: itemsError
      }, { status: 500 });
    }

    console.log("📋 Raw items data:", JSON.stringify(itemsData, null, 2));

    // Process items
    const processedItems = (itemsData ?? []).map((i: any) => {
      const unitPrice = i.product_price ?? i.price ?? 0;
      return {
        id: i.id,
        product_name: i.product_name,
        quantity: i.quantity,
        price: Number(unitPrice),
        subtotal: Number(unitPrice) * Number(i.quantity),
        product_id: i.product_id,
        products: i.products,
        product_image: i.products?.image_url || null,
        has_image: !!i.products?.image_url
      };
    });

    console.log("📋 Processed items:", JSON.stringify(processedItems, null, 2));

    return NextResponse.json({
      success: true,
      order: recentOrder,
      items: processedItems,
      raw_items: itemsData,
      summary: {
        total_items: processedItems.length,
        items_with_images: processedItems.filter(item => item.has_image).length,
        items_without_images: processedItems.filter(item => !item.has_image).length
      }
    });

  } catch (error) {
    console.error("❌ Order items test error:", error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Unknown error",
      success: false
    }, { status: 500 });
  }
}
