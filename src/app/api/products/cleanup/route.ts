import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: NextRequest) {
  try {
    console.log("🧹 Starting cleanup of fake products...");

    // Отримуємо всі товари
    const { data: allProducts, error: fetchError } = await supabaseAdmin
      .from("products")
      .select("id, name, external_id, created_at");

    if (fetchError) {
      throw new Error(`Database error: ${fetchError.message}`);
    }

    if (!allProducts || allProducts.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No products found in database",
        stats: { total: 0, deleted: 0, kept: 0 },
      });
    }

    console.log(`📦 Found ${allProducts.length} products in database`);

    // Визначаємо фейкові товари
    const fakeProducts = allProducts.filter((product) => {
      // Товари без external_id (не імпортовані)
      if (!product.external_id) {
        return true;
      }

      // Товари з підозрілими назвами
      const suspiciousNames = [
        "test",
        "dummy",
        "placeholder",
        "example",
        "sample",
        "тест",
        "приклад",
        "заглушка",
        "образец",
      ];

      const name = product.name.toLowerCase();
      return suspiciousNames.some((suspicious) => name.includes(suspicious));
    });

    console.log(`🔍 Found ${fakeProducts.length} fake products to delete`);

    if (fakeProducts.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No fake products found",
        stats: {
          total: allProducts.length,
          deleted: 0,
          kept: allProducts.length,
        },
      });
    }

    // Видаляємо фейкові товари
    const fakeProductIds = fakeProducts.map((p) => p.id);

    const { error: deleteError } = await supabaseAdmin
      .from("products")
      .delete()
      .in("id", fakeProductIds);

    if (deleteError) {
      throw new Error(`Delete error: ${deleteError.message}`);
    }

    const kept = allProducts.length - fakeProducts.length;

    console.log(
      `✅ Cleanup completed: ${fakeProducts.length} deleted, ${kept} kept`
    );

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${fakeProducts.length} fake products`,
      stats: {
        total: allProducts.length,
        deleted: fakeProducts.length,
        kept: kept,
      },
      deletedProducts: fakeProducts.map((p) => ({
        id: p.id,
        name: p.name,
        external_id: p.external_id,
      })),
    });
  } catch (error) {
    console.error("❌ Error in cleanup:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to cleanup fake products",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Checking for fake products...");

    // Отримуємо всі товари
    const { data: allProducts, error: fetchError } = await supabaseAdmin
      .from("products")
      .select("id, name, external_id, created_at");

    if (fetchError) {
      throw new Error(`Database error: ${fetchError.message}`);
    }

    if (!allProducts || allProducts.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No products found in database",
        stats: { total: 0, fake: 0, real: 0 },
      });
    }

    // Визначаємо фейкові товари
    const fakeProducts = allProducts.filter((product) => {
      if (!product.external_id) {
        return true;
      }

      const suspiciousNames = [
        "test",
        "dummy",
        "placeholder",
        "example",
        "sample",
        "тест",
        "приклад",
        "заглушка",
        "образец",
      ];

      const name = product.name.toLowerCase();
      return suspiciousNames.some((suspicious) => name.includes(suspicious));
    });

    const realProducts = allProducts.filter(
      (product) => !fakeProducts.includes(product)
    );

    return NextResponse.json({
      success: true,
      message: "Fake products analysis completed",
      stats: {
        total: allProducts.length,
        fake: fakeProducts.length,
        real: realProducts.length,
      },
      fakeProducts: fakeProducts.map((p) => ({
        id: p.id,
        name: p.name,
        external_id: p.external_id,
        created_at: p.created_at,
      })),
    });
  } catch (error) {
    console.error("❌ Error checking fake products:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to check fake products",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
