import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Мапінг категорій з ID на назви
const categoryMap: { [key: string]: string } = {
  "3": "Power Banks",
  "15": "Зарядні пристрої",
  "16": "Кабелі",
  "17": "Адаптери",
  "18": "Держателі",
  "19": "Чохли",
  "20": "Навушники",
  "21": "Колонки",
  "22": "Аксесуари",
};

export async function POST(request: NextRequest) {
  try {
    console.log("🔄 Starting category update process...");

    // Отримуємо всі товари з категоріями-ID
    const { data: products, error: fetchError } = await supabaseAdmin
      .from("products")
      .select("id, category")
      .not("category", "is", null);

    if (fetchError) {
      throw new Error(`Database error: ${fetchError.message}`);
    }

    if (!products || products.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No products found to update",
        stats: { total: 0, updated: 0 },
      });
    }

    console.log(`📦 Found ${products.length} products to check`);

    let updated = 0;
    const updates = [];

    // Оновлюємо категорії
    for (const product of products) {
      const currentCategory = product.category;
      
      // Перевіряємо, чи це ID категорії (число)
      if (categoryMap[currentCategory]) {
        updates.push({
          id: product.id,
          category: categoryMap[currentCategory],
        });
        updated++;
      }
    }

    console.log(`🔍 Found ${updates.length} products to update`);

    if (updates.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No products need category updates",
        stats: { total: products.length, updated: 0 },
      });
    }

    // Виконуємо оновлення
    for (const update of updates) {
      const { error: updateError } = await supabaseAdmin
        .from("products")
        .update({ category: update.category })
        .eq("id", update.id);

      if (updateError) {
        console.error(`❌ Error updating product ${update.id}:`, updateError);
      } else {
        console.log(`✅ Updated product ${update.id}: ${update.category}`);
      }
    }

    console.log(`✅ Category update completed: ${updated} products updated`);

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${updated} product categories`,
      stats: {
        total: products.length,
        updated: updated,
      },
    });
  } catch (error) {
    console.error("❌ Error in category update:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update categories",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
