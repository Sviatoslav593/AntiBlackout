import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Checking products without categories...");

    // Перевіряємо товари без категорій
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

    // Перевіряємо товари з неіснуючими категоріями
    const { data: allProducts, error: allProductsError } = await supabaseAdmin
      .from("products")
      .select("id, external_id, name, category_id");

    if (allProductsError) {
      console.error("❌ Error fetching all products:", allProductsError);
      return NextResponse.json({
        success: false,
        error: allProductsError.message,
      });
    }

    // Отримуємо всі існуючі category_id
    const { data: categories, error: categoriesError } = await supabaseAdmin
      .from("categories")
      .select("id");

    if (categoriesError) {
      console.error("❌ Error fetching categories:", categoriesError);
      return NextResponse.json({
        success: false,
        error: categoriesError.message,
      });
    }

    const existingCategoryIds = new Set(categories?.map((c) => c.id) || []);

    // Знаходимо товари з неіснуючими категоріями
    const productsWithInvalidCategories =
      allProducts?.filter(
        (product) =>
          product.category_id && !existingCategoryIds.has(product.category_id)
      ) || [];

    console.log(
      `📊 Found ${
        productsWithoutCategories?.length || 0
      } products without categories`
    );
    console.log(
      `📊 Found ${productsWithInvalidCategories.length} products with invalid categories`
    );

    return NextResponse.json({
      success: true,
      stats: {
        totalProducts: allProducts?.length || 0,
        withoutCategories: productsWithoutCategories?.length || 0,
        withInvalidCategories: productsWithInvalidCategories.length,
        withValidCategories:
          (allProducts?.length || 0) -
          (productsWithoutCategories?.length || 0) -
          productsWithInvalidCategories.length,
      },
      productsWithoutCategories: productsWithoutCategories?.slice(0, 10) || [], // Показуємо тільки перші 10
      productsWithInvalidCategories: productsWithInvalidCategories.slice(0, 10), // Показуємо тільки перші 10
    });
  } catch (error) {
    console.error("❌ Unexpected error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
