import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/client";

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();

    // Get total count
    const { count: totalCount, error: countError } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true });

    if (countError) {
      console.error("Error getting total count:", countError);
      return NextResponse.json({ success: false, error: countError.message }, { status: 500 });
    }

    // Get count with category filter
    const { count: categoryCount, error: categoryCountError } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .in("category_id", [3, 15, 16, 80]);

    if (categoryCountError) {
      console.error("Error getting category count:", categoryCountError);
      return NextResponse.json({ success: false, error: categoryCountError.message }, { status: 500 });
    }

    // Get count without any filters
    const { count: unfilteredCount, error: unfilteredError } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .not("category_id", "is", null);

    if (unfilteredError) {
      console.error("Error getting unfiltered count:", unfilteredError);
      return NextResponse.json({ success: false, error: unfilteredError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      counts: {
        total: totalCount,
        withCategories: unfilteredCount,
        withSpecificCategories: categoryCount
      }
    });
  } catch (error: any) {
    console.error("Error in count API:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
