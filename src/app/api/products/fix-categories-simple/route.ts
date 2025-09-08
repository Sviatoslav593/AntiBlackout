import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: NextRequest) {
  try {
    console.log("🔄 Fixing product categories based on product names...");

    // Отримуємо всі товари з категорією "Uncategorized"
    const { data: products, error: fetchError } = await supabaseAdmin
      .from("products")
      .select("id, name, category")
      .eq("category", "Uncategorized");

    if (fetchError) {
      throw fetchError;
    }

    console.log(`📦 Found ${products?.length || 0} products with Uncategorized to fix`);

    let updatedCount = 0;
    let errorCount = 0;

    // Оновлюємо категорії на основі назв товарів
    for (const product of products || []) {
      try {
        let newCategory = "Uncategorized";
        const name = product.name.toLowerCase();

        // Визначаємо категорію на основі назви товару
        if (name.includes("power bank") || name.includes("повербанк") || name.includes("батарея") || name.includes("акумулятор")) {
          newCategory = "Портативні батареї";
        } else if (name.includes("зарядний") || name.includes("зарядка") || name.includes("адаптер") || name.includes("charger")) {
          newCategory = "Мережеві зарядні пристрої";
        } else if (name.includes("кабель") || name.includes("cable") || name.includes("usb") || name.includes("lightning") || name.includes("type-c")) {
          newCategory = "Кабелі USB";
        } else if (name.includes("бездротовий") || name.includes("wireless") || name.includes("qi")) {
          newCategory = "Бездротові зарядні пристрої";
        }

        if (newCategory !== "Uncategorized") {
          const { error: updateError } = await supabaseAdmin
            .from("products")
            .update({ category: newCategory })
            .eq("id", product.id);

          if (updateError) {
            console.error(`❌ Error updating product ${product.id}:`, updateError);
            errorCount++;
          } else {
            updatedCount++;
            console.log(`✅ Updated product ${product.id}: ${product.name.substring(0, 50)}... -> ${newCategory}`);
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
