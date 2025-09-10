import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();

    // Get unique brands from products
    const { data: products, error } = await supabase
      .from("products")
      .select("brand")
      .not("brand", "is", null)
      .not("brand", "eq", "");

    if (error) {
      console.error("Error fetching brands:", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch brands" },
        { status: 500 }
      );
    }

    // Extract unique brands
    const brands = [
      ...new Set(products.map((product) => product.brand)),
    ].filter((brand) => brand && brand.trim() !== "");

    // Sort brands alphabetically
    brands.sort();

    return NextResponse.json({
      success: true,
      brands: brands,
    });
  } catch (error) {
    console.error("Error in brands API:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
