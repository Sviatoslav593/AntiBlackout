import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { parseXMLFeed, validateProducts, ParsedProduct } from "@/lib/xmlParser";

const XML_FEED_URL = "https://mma.in.ua/feed/xml/iDxAyRECF.xml";

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 Starting product import process...");

    // Отримуємо XML дані
    const products = await parseXMLFeed(XML_FEED_URL);
    console.log(`📦 Parsed ${products.length} products from XML feed`);

    // Валідуємо товари
    const { valid, invalid, stats } = validateProducts(products);
    console.log("📊 Validation stats:", stats);

    if (valid.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No valid products found in XML feed",
        stats,
      }, { status: 400 });
    }

    // Імпортуємо товари в базу даних
    const importResult = await importProductsToDatabase(valid);
    console.log("✅ Import completed:", importResult);

    return NextResponse.json({
      success: true,
      message: "Products imported successfully",
      stats: {
        ...stats,
        imported: importResult.imported,
        updated: importResult.updated,
        errors: importResult.errors,
      },
      details: {
        validProducts: valid.length,
        invalidProducts: invalid.length,
        imported: importResult.imported,
        updated: importResult.updated,
        errors: importResult.errors,
      },
    });

  } catch (error) {
    console.error("❌ Error in product import:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to import products",
      error: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Checking product import status...");

    // Отримуємо статистику товарів
    const { data: products, error } = await supabaseAdmin
      .from("products")
      .select("external_id, name, price, brand, category, quantity, image_url, created_at, updated_at");

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    const stats = {
      total: products?.length || 0,
      withExternalId: products?.filter(p => p.external_id).length || 0,
      withPrice: products?.filter(p => p.price && p.price > 0).length || 0,
      inStock: products?.filter(p => p.quantity && p.quantity > 0).length || 0,
      withImages: products?.filter(p => p.image_url).length || 0,
    };

    return NextResponse.json({
      success: true,
      message: "Product import status retrieved",
      stats,
      products: products?.slice(0, 10), // Повертаємо перші 10 товарів для перевірки
    });

  } catch (error) {
    console.error("❌ Error checking import status:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to check import status",
      error: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
}

/**
 * Імпортує товари в базу даних
 */
async function importProductsToDatabase(products: ParsedProduct[]): Promise<{
  imported: number;
  updated: number;
  errors: number;
}> {
  let imported = 0;
  let updated = 0;
  let errors = 0;

  console.log(`🔄 Starting database import of ${products.length} products...`);

  for (const product of products) {
    try {
      // Перевіряємо, чи існує товар з таким external_id
      const { data: existingProduct, error: checkError } = await supabaseAdmin
        .from("products")
        .select("id, external_id")
        .eq("external_id", product.external_id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error(`❌ Error checking product ${product.external_id}:`, checkError);
        errors++;
        continue;
      }

      const productData = {
        external_id: product.external_id,
        name: product.name,
        description: product.description,
        price: product.price,
        brand: product.brand,
        category: product.category,
        quantity: product.quantity,
        image_url: product.image_url,
        updated_at: new Date().toISOString(),
      };

      if (existingProduct) {
        // Оновлюємо існуючий товар
        const { error: updateError } = await supabaseAdmin
          .from("products")
          .update(productData)
          .eq("id", existingProduct.id);

        if (updateError) {
          console.error(`❌ Error updating product ${product.external_id}:`, updateError);
          errors++;
        } else {
          console.log(`✅ Updated product: ${product.name} (${product.external_id})`);
          updated++;
        }
      } else {
        // Створюємо новий товар
        const { error: insertError } = await supabaseAdmin
          .from("products")
          .insert([{
            ...productData,
            id: crypto.randomUUID(), // Генеруємо UUID
            created_at: new Date().toISOString(),
          }]);

        if (insertError) {
          console.error(`❌ Error inserting product ${product.external_id}:`, insertError);
          errors++;
        } else {
          console.log(`✅ Imported product: ${product.name} (${product.external_id})`);
          imported++;
        }
      }

    } catch (error) {
      console.error(`❌ Unexpected error processing product ${product.external_id}:`, error);
      errors++;
    }
  }

  console.log(`✅ Import completed: ${imported} imported, ${updated} updated, ${errors} errors`);
  return { imported, updated, errors };
}
