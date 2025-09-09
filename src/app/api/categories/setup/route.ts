import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 Setting up categories...");

    // Додаємо категорії з XML фіду
    const categories = [
      { id: 1, name: "Акумулятори та powerbank", parent_id: null },
      { id: 3, name: "Портативні батареї", parent_id: 1 },
      { id: 14, name: "Зарядки та кабелі", parent_id: null },
      { id: 15, name: "Мережеві зарядні пристрої", parent_id: 14 },
      { id: 16, name: "Кабелі usb", parent_id: 14 },
      { id: 80, name: "Бездротові зарядні пристрої", parent_id: 14 },
    ];

    const { error } = await supabaseAdmin
      .from("categories")
      .upsert(categories, { onConflict: "id" });

    if (error) {
      console.error("❌ Error setting up categories:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to setup categories",
          error: error.message,
        },
        { status: 500 }
      );
    }

    console.log("✅ Categories setup completed");

    return NextResponse.json({
      success: true,
      message: "Categories setup successfully",
      categories: categories.length,
    });
  } catch (error) {
    console.error("❌ Error in categories setup:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to setup categories",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
