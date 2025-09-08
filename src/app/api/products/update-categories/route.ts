import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Тепер категорії зберігаються безпосередньо з XML, тому цей мапінг не потрібен

export async function POST(request: NextRequest) {
  try {
    console.log("🔄 Checking category status...");

    // Отримуємо всі товари з категоріями
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
        message: "No products found",
        stats: { total: 0, updated: 0 },
      });
    }

    console.log(`📦 Found ${products.length} products`);

    // Перевіряємо, скільки товарів мають числові категорії (ID)
    const numericCategories = products.filter(p => p.category && p.category.match(/^\d+$/));
    
    if (numericCategories.length === 0) {
      return NextResponse.json({
        success: true,
        message: "All categories are already in correct format (names, not IDs)",
        stats: { total: products.length, updated: 0 },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Found ${numericCategories.length} products with numeric categories. Please run product import to update categories with proper names from XML.`,
      stats: { 
        total: products.length, 
        updated: 0,
        needsImport: numericCategories.length 
      },
    });
  } catch (error) {
    console.error("❌ Error in category check:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to check categories",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
