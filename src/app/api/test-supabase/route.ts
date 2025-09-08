import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/client";

export async function GET(request: NextRequest) {
  try {
    console.log("🔄 Testing Supabase connection from API...");

    const supabase = createClient();

    const { data: products, error } = await supabase
      .from("products")
      .select(
        "id, name, description, price, external_id, brand, category, quantity, image_url, created_at"
      )
      .limit(50);

    if (error) {
      console.error("❌ Supabase error:", error);
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          details: error,
        },
        { status: 500 }
      );
    }

    console.log("✅ Supabase connection successful!");
    console.log(`📦 Found ${products?.length || 0} products`);

    return NextResponse.json({
      success: true,
      message: "Supabase connection successful",
      products: products || [],
      count: products?.length || 0,
    });
  } catch (error) {
    console.error("❌ Error testing Supabase connection:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        details: error,
      },
      { status: 500 }
    );
  }
}
