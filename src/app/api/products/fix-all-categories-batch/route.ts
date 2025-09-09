import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { parseXMLFeed } from "@/lib/xmlParser";

export async function POST(request: NextRequest) {
  try {
    console.log("🔧 Fixing ALL product categories in batches...");

    // Отримуємо XML дані
    const products = await parseXMLFeed(
      "https://mma.in.ua/feed/xml/iDxAyRECF.xml"
    );
    console.log(`📦 Parsed ${products.length} products from XML feed`);

    // Створюємо мапу external_id -> category_id
    const categoryMap = new Map();
    products.forEach((product) => {
      categoryMap.set(product.external_id, product.category_id);
    });

    console.log(`📊 Created category map with ${categoryMap.size} entries`);

    // Отримуємо всі товари з бази даних по частинах
    const batchSize = 1000;
    let offset = 0;
    let totalUpdated = 0;
    let totalErrors = 0;
    let totalSkipped = 0;

    while (true) {
      console.log(`🔄 Processing batch starting at offset ${offset}...`);

      const { data: dbProducts, error: dbError } = await supabaseAdmin
        .from("products")
        .select("id, external_id, name, category_id")
        .range(offset, offset + batchSize - 1);

      if (dbError) {
        console.error("❌ Error fetching products batch:", dbError);
        return NextResponse.json({ success: false, error: dbError.message });
      }

      if (!dbProducts || dbProducts.length === 0) {
        console.log("✅ No more products to process");
        break;
      }

      console.log(`📊 Processing ${dbProducts.length} products in this batch`);

      let batchUpdated = 0;
      let batchErrors = 0;
      let batchSkipped = 0;

      // Оновлюємо category_id для кожного товару в цій партії
      for (const product of dbProducts) {
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
              batchErrors++;
            } else {
              batchUpdated++;
            }
          } else if (!newCategoryId) {
            batchSkipped++;
          } else {
            batchSkipped++;
          }
        } catch (error) {
          console.error(
            `❌ Unexpected error processing product ${product.external_id}:`,
            error
          );
          batchErrors++;
        }
      }

      totalUpdated += batchUpdated;
      totalErrors += batchErrors;
      totalSkipped += batchSkipped;

      console.log(
        `✅ Batch completed: ${batchUpdated} updated, ${batchSkipped} skipped, ${batchErrors} errors`
      );

      offset += batchSize;
    }

    console.log(
      `✅ All batches completed: ${totalUpdated} updated, ${totalSkipped} skipped, ${totalErrors} errors`
    );

    return NextResponse.json({
      success: true,
      message: "All product categories fixed successfully",
      stats: {
        totalUpdated,
        totalSkipped,
        totalErrors,
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
