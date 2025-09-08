import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: NextRequest) {
  try {
    console.log("🧹 Starting cleanup of invalid products...");

    // Отримуємо всі товари з необхідними полями для валідації
    const { data: allProducts, error: fetchError } = await supabaseAdmin
      .from("products")
      .select("id, name, external_id, price, image_url, created_at");

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

    // Визначаємо невалідні товари
    const invalidProducts = allProducts.filter((product) => {
      // Товари без назви
      if (!product.name || product.name.trim().length === 0) {
        return true;
      }

      // Товари з ціною менше 1
      if (!product.price || product.price < 1) {
        return true;
      }

      // Товари без зображення
      if (!product.image_url || product.image_url.trim().length === 0) {
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

    console.log(
      `🔍 Found ${invalidProducts.length} invalid products to delete`
    );

    if (invalidProducts.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No invalid products found",
        stats: {
          total: allProducts.length,
          deleted: 0,
          kept: allProducts.length,
        },
      });
    }

    // Видаляємо невалідні товари
    const invalidProductIds = invalidProducts.map((p) => p.id);

    const { error: deleteError } = await supabaseAdmin
      .from("products")
      .delete()
      .in("id", invalidProductIds);

    if (deleteError) {
      throw new Error(`Delete error: ${deleteError.message}`);
    }

    const kept = allProducts.length - invalidProducts.length;

    console.log(
      `✅ Cleanup completed: ${invalidProducts.length} deleted, ${kept} kept`
    );

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${invalidProducts.length} invalid products`,
      stats: {
        total: allProducts.length,
        deleted: invalidProducts.length,
        kept: kept,
      },
      deletedProducts: invalidProducts.map((p) => ({
        id: p.id,
        name: p.name,
        external_id: p.external_id,
        price: p.price,
        hasImage: !!p.image_url,
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
    console.log("🔍 Checking for invalid products...");

    // Отримуємо всі товари з необхідними полями для валідації
    const { data: allProducts, error: fetchError } = await supabaseAdmin
      .from("products")
      .select("id, name, external_id, price, image_url, created_at");

    if (fetchError) {
      throw new Error(`Database error: ${fetchError.message}`);
    }

    if (!allProducts || allProducts.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No products found in database",
        stats: { total: 0, invalid: 0, valid: 0 },
      });
    }

    // Визначаємо невалідні товари
    const invalidProducts = allProducts.filter((product) => {
      // Товари без назви
      if (!product.name || product.name.trim().length === 0) {
        return true;
      }

      // Товари з ціною менше 1
      if (!product.price || product.price < 1) {
        return true;
      }

      // Товари без зображення
      if (!product.image_url || product.image_url.trim().length === 0) {
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

    const validProducts = allProducts.filter(
      (product) => !invalidProducts.includes(product)
    );

    return NextResponse.json({
      success: true,
      message: "Invalid products analysis completed",
      stats: {
        total: allProducts.length,
        invalid: invalidProducts.length,
        valid: validProducts.length,
      },
      invalidProducts: invalidProducts.map((p) => ({
        id: p.id,
        name: p.name,
        external_id: p.external_id,
        price: p.price,
        hasImage: !!p.image_url,
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
