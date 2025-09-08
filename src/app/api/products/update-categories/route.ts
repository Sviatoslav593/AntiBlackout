import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { parseXMLFeed } from "@/lib/xmlParser";

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 Updating product categories...");

    // Отримуємо XML дані
    const products = await parseXMLFeed("https://mma.in.ua/feed/xml/iDxAyRECF.xml");
    console.log(`📦 Parsed ${products.length} products from XML feed`);

    let updated = 0;
    let errors = 0;

    // Створюємо мапу external_id -> category_id
    const categoryMap = new Map();
    products.forEach(product => {
      categoryMap.set(product.external_id, product.category_id);
    });

    console.log(`📊 Created category map with ${categoryMap.size} entries`);

    // Отримуємо всі товари з бази даних
    const { data: dbProducts, error: fetchError } = await supabaseAdmin
      .from("products")
      .select("id, external_id, category_id");

    if (fetchError) {
      throw new Error(`Database error: ${fetchError.message}`);
    }

    console.log(`📦 Found ${dbProducts?.length || 0} products in database`);

    // Оновлюємо category_id для кожного товару
    for (const product of dbProducts || []) {
      try {
        const newCategoryId = categoryMap.get(product.external_id);
        
        if (newCategoryId && newCategoryId !== product.category_id) {
          // Пропускаємо товари з category_id=80
          if (newCategoryId === 80) {
            console.log(`⏭️ Skipping product with category_id=80: ${product.external_id}`);
            continue;
          }

          const { error: updateError } = await supabaseAdmin
            .from("products")
            .update({ category_id: newCategoryId })
            .eq("id", product.id);

          if (updateError) {
            console.error(`❌ Error updating product ${product.external_id}:`, updateError);
            errors++;
          } else {
            console.log(`✅ Updated category for product: ${product.external_id} -> ${newCategoryId}`);
            updated++;
          }
        }
      } catch (error) {
        console.error(`❌ Unexpected error processing product ${product.external_id}:`, error);
        errors++;
      }
    }

    console.log(`✅ Category update completed: ${updated} updated, ${errors} errors`);

    return NextResponse.json({
      success: true,
      message: "Product categories updated successfully",
      stats: {
        updated,
        errors,
        total: dbProducts?.length || 0,
      },
    });
  } catch (error) {
    console.error("❌ Error updating product categories:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update product categories",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}