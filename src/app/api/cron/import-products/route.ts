import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { parseXMLFeed, validateProducts } from "@/lib/xmlParser";

const XML_FEED_URL = "https://mma.in.ua/feed/xml/iDxAyRECF.xml";

export async function GET(request: NextRequest) {
  try {
    console.log("⏰ Cron job: Starting scheduled product import...");

    // Перевіряємо, чи це дійсно cron запит
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET || "default-cron-secret";
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      console.log("❌ Unauthorized cron request");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Отримуємо XML дані
    const products = await parseXMLFeed(XML_FEED_URL);
    console.log(`📦 Parsed ${products.length} products from XML feed`);

    // Валідуємо товари
    const { valid, invalid, stats } = validateProducts(products);
    console.log("📊 Validation stats:", stats);

    if (valid.length === 0) {
      console.log("⚠️ No valid products found in XML feed");
      return NextResponse.json({
        success: false,
        message: "No valid products found in XML feed",
        stats,
      });
    }

    // Імпортуємо товари в базу даних
    const importResult = await importProductsToDatabase(valid);
    console.log("✅ Import completed:", importResult);

    // Логуємо результат в базу даних
    await logImportResult({
      success: true,
      imported: importResult.imported,
      updated: importResult.updated,
      errors: importResult.errors,
      totalProcessed: valid.length,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "Scheduled import completed successfully",
      stats: {
        ...stats,
        imported: importResult.imported,
        updated: importResult.updated,
        errors: importResult.errors,
      },
    });

  } catch (error) {
    console.error("❌ Error in scheduled import:", error);

    // Логуємо помилку
    await logImportResult({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: false,
      message: "Scheduled import failed",
      error: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
}

/**
 * Імпортує товари в базу даних
 */
async function importProductsToDatabase(products: any[]): Promise<{
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
          updated++;
        }
      } else {
        // Створюємо новий товар
        const { error: insertError } = await supabaseAdmin
          .from("products")
          .insert([{
            ...productData,
            id: crypto.randomUUID(),
            created_at: new Date().toISOString(),
          }]);

        if (insertError) {
          console.error(`❌ Error inserting product ${product.external_id}:`, insertError);
          errors++;
        } else {
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

/**
 * Логує результат імпорту в базу даних
 */
async function logImportResult(result: {
  success: boolean;
  imported?: number;
  updated?: number;
  errors?: number;
  totalProcessed?: number;
  error?: string;
  timestamp: string;
}) {
  try {
    const { error } = await supabaseAdmin
      .from("import_logs")
      .insert([{
        id: crypto.randomUUID(),
        success: result.success,
        imported: result.imported || 0,
        updated: result.updated || 0,
        errors: result.errors || 0,
        total_processed: result.totalProcessed || 0,
        error_message: result.error || null,
        created_at: result.timestamp,
      }]);

    if (error) {
      console.error("❌ Error logging import result:", error);
    }
  } catch (error) {
    console.error("❌ Error in logImportResult:", error);
  }
}
