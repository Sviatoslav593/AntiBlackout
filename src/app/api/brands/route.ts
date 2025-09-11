import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  try {
    console.log("Brands API: Starting request");
    const supabase = createServerClient();
    console.log("Brands API: Supabase client created");

    // Get unique brands from products
    const { data: products, error } = await supabase
      .from("products")
      .select("brand")
      .not("brand", "is", null)
      .not("brand", "eq", "");

    console.log("Brands API: Query result:", { products, error });

    if (error) {
      console.error("Error fetching brands:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch brands",
          details: error.message,
        },
        { status: 500 }
      );
    }

    // Extract unique brands
    const brands = [
      ...new Set(products.map((product) => product.brand)),
    ].filter((brand) => brand && brand.trim() !== "");

    // Sort brands alphabetically
    brands.sort();

    const response = {
      success: true,
      brands: brands,
    };

    console.log("Brands API: Returning response:", response);
    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in brands API:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
