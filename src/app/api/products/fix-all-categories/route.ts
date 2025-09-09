import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { parseXMLFeed } from "@/lib/xmlParser";

export async function POST(request: NextRequest) {
  try {
    console.log("🔧 Fixing all product categories...");

    // Отримуємо XML дані
    const products = await parseXMLFeed("https://mma.in.ua/feed/xml/iDxAyRECF.xml");
    console.log(`📦 Parsed ${products.length} products from XML feed`);

    // Створюємо мапу external_id -> category_id
    const categoryMap = new Map();
    products.forEach((product) => {
      categoryMap.set(product.external_id, product.category_id);
    });

    console.log(`📊 Created category map with ${categoryMap.size} entries`);

    // Отримуємо всі товари з бази даних
    const { data: dbProducts, error: dbError } = await supabaseAdmin
      .from("products")
      .select("id, external_id, name, category_id");

    if (dbError) {
      console.error("❌ Error fetching products:", dbError);
      return NextResponse.json({ success: false, error: dbError.message });
    }

    console.log(`📊 Found ${dbProducts?.length || 0} products in database`);

    let updated = 0;
    let errors = 0;
    let skipped = 0;

    // Оновлюємо category_id для кожного товару
    for (const product of dbProducts || []) {
      try {
        const newCategoryId = categoryMap.get(product.external_id);

        if (newCategoryId && newCategoryId !== product.category_id) {
          const { error: updateError } = await supabaseAdmin
            .from("products")
            .update({ category_id: newCategoryId })
            .eq("id", product.id);

          if (updateError) {
            console.error(
              `❌ Error updating product ${product.external_id}:`,
              updateError
            );
            errors++;
          } else {
            console.log(
              `✅ Updated category for product: ${product.external_id} -> ${newCategoryId}`
            );
            updated++;
          }
        } else if (!newCategoryId) {
          console.log(`⚠️ No XML data for product: ${product.external_id}`);
          skipped++;
        } else {
          console.log(`ℹ️ Product ${product.external_id} already has correct category`);
          skipped++;
        }
      } catch (error) {
        console.error(
          `❌ Unexpected error processing product ${product.external_id}:`,
          error
        );
        errors++;
      }
    }

    console.log(
      `✅ Category fix completed: ${updated} updated, ${skipped} skipped, ${errors} errors`
    );

    return NextResponse.json({
      success: true,
      message: "Product categories fixed successfully",
      stats: {
        total: dbProducts?.length || 0,
        updated,
        skipped,
        errors,
      },
    });
  } catch (error) {
    console.error("❌ Unexpected error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
