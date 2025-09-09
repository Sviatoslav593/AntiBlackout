import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/client";

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();

    // Простий тест JOIN
    const { data: products, error } = await supabase
      .from("products")
      .select(
        `
        id,
        name,
        category_id,
        categories(id, name, parent_id)
      `
      )
      .eq("category_id", 15)
      .limit(5);

    if (error) {
      console.error("Error:", error);
      return NextResponse.json({ success: false, error: error.message });
    }

    return NextResponse.json({
      success: true,
      products: products || [],
      count: products?.length || 0,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
