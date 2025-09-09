import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Checking ALL products for categories...");

    // Перевіряємо товари без категорій (всі товари)
    const { data: productsWithoutCategories, error: noCategoryError } =
      await supabaseAdmin
        .from("products")
        .select("id, external_id, name, category_id")
        .is("category_id", null);

    if (noCategoryError) {
      console.error(
        "❌ Error checking products without categories:",
        noCategoryError
      );
      return NextResponse.json({
        success: false,
        error: noCategoryError.message,
      });
    }

    // Отримуємо загальну кількість товарів
    const { count: totalCount, error: totalError } = await supabaseAdmin
      .from("products")
      .select("*", { count: "exact", head: true });

    if (totalError) {
      console.error("❌ Error getting total count:", totalError);
      return NextResponse.json({ success: false, error: totalError.message });
    }

    // Отримуємо товари з категоріями
    const { data: productsWithCategories, error: withCategoryError } =
      await supabaseAdmin
        .from("products")
        .select("id, external_id, name, category_id")
        .not("category_id", "is", null);

    if (withCategoryError) {
      console.error(
        "❌ Error checking products with categories:",
        withCategoryError
      );
      return NextResponse.json({
        success: false,
        error: withCategoryError.message,
      });
    }

    console.log(`📊 Total products: ${totalCount}`);
    console.log(
      `📊 Products without categories: ${
        productsWithoutCategories?.length || 0
      }`
    );
    console.log(
      `📊 Products with categories: ${productsWithCategories?.length || 0}`
    );

    return NextResponse.json({
      success: true,
      stats: {
        totalProducts: totalCount || 0,
        withoutCategories: productsWithoutCategories?.length || 0,
        withCategories: productsWithCategories?.length || 0,
        percentageWithCategories: totalCount
          ? Math.round(
              ((productsWithCategories?.length || 0) / totalCount) * 100
            )
          : 0,
      },
      sampleWithoutCategories: productsWithoutCategories?.slice(0, 5) || [],
      sampleWithCategories: productsWithCategories?.slice(0, 5) || [],
    });
  } catch (error) {
    console.error("❌ Unexpected error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
