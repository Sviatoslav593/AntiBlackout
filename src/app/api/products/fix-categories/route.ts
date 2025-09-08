import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: NextRequest) {
  try {
    console.log("🔄 Fixing product categories...");

    // Отримуємо всі товари з бази даних
    const { data: products, error: fetchError } = await supabaseAdmin
      .from("products")
      .select("id, external_id, category");

    if (fetchError) {
      throw fetchError;
    }

    console.log(`📦 Found ${products?.length || 0} products to update`);

    // Мапінг категорій з XML фіду
    const categoryMap: { [key: string]: string } = {
      "1": "Акумулятори та powerbank",
      "3": "Портативні батареї", 
      "14": "Зарядки та кабелі",
      "15": "Мережеві зарядні пристрої",
      "16": "Кабелі USB",
      "80": "Бездротові зарядні пристрої"
    };

    let updatedCount = 0;
    let errorCount = 0;

    // Оновлюємо категорії товарів
    for (const product of products || []) {
      try {
        // Отримуємо categoryId з external_id (якщо потрібно) або використовуємо поточну категорію
        let categoryId = null;
        
        // Якщо поточна категорія - це ID, використовуємо її
        if (product.category && Object.keys(categoryMap).includes(product.category)) {
          categoryId = product.category;
        } else {
          // Спробуємо отримати categoryId з XML фіду для цього товару
          // Поки що пропускаємо товари без categoryId
          continue;
        }

        const newCategory = categoryMap[categoryId];
        if (newCategory && newCategory !== product.category) {
          const { error: updateError } = await supabaseAdmin
            .from("products")
            .update({ category: newCategory })
            .eq("id", product.id);

          if (updateError) {
            console.error(`❌ Error updating product ${product.id}:`, updateError);
            errorCount++;
          } else {
            updatedCount++;
            console.log(`✅ Updated product ${product.id}: ${product.category} -> ${newCategory}`);
          }
        }
      } catch (error) {
        console.error(`❌ Error processing product ${product.id}:`, error);
        errorCount++;
      }
    }

    console.log(`✅ Category fix completed: ${updatedCount} updated, ${errorCount} errors`);

    return NextResponse.json({
      success: true,
      message: "Categories fixed successfully",
      stats: {
        total: products?.length || 0,
        updated: updatedCount,
        errors: errorCount
      }
    });

  } catch (error) {
    console.error("❌ Error fixing categories:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fix categories",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
