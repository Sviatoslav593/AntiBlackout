import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/client";

const XML_FEED_URL = "https://mma.in.ua/feed/xml/iDxAyRECF.xml";

export async function POST(request: NextRequest) {
  try {
    console.log("🔄 Starting categories import...");

    // Отримуємо XML дані
    const response = await fetch(XML_FEED_URL, {
      headers: {
        "User-Agent": "Antiblackout-Category-Importer/1.0",
        Accept: "application/xml, text/xml, */*",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const xmlData = await response.text();
    console.log(
      `✅ XML feed fetched successfully (${xmlData.length} characters)`
    );

    // Парсимо XML
    const { parseString } = await import("xml2js");
    const parsedData = await new Promise((resolve, reject) => {
      parseString(
        xmlData,
        {
          explicitArray: false,
          mergeAttrs: true,
          trim: true,
        },
        (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        }
      );
    });

    if (
      !parsedData ||
      !parsedData.price ||
      !parsedData.price.catalog ||
      !parsedData.price.catalog.category
    ) {
      throw new Error("Invalid XML structure: categories not found");
    }

    // Витягуємо категорії
    const categories = Array.isArray(parsedData.price.catalog.category)
      ? parsedData.price.catalog.category
      : [parsedData.price.catalog.category];

    console.log(`📂 Found ${categories.length} categories in XML feed`);

    const supabase = createClient();
    let imported = 0;
    let errors = 0;

    // Імпортуємо категорії
    for (const category of categories) {
      try {
        if (category && category.$ && category.$.id && category._) {
          const categoryData = {
            id: parseInt(category.$.id),
            name: category._.trim(),
            parent_id: category.$.parentId
              ? parseInt(category.$.parentId)
              : null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          const { error } = await supabase
            .from("categories")
            .upsert(categoryData, {
              onConflict: "id",
            });

          if (error) {
            console.error(
              `❌ Error importing category ${categoryData.id}:`,
              error
            );
            errors++;
          } else {
            console.log(`✅ Imported category: ${categoryData.name}`);
            imported++;
          }
        }
      } catch (error) {
        console.error(`❌ Error processing category:`, error);
        errors++;
      }
    }

    console.log(
      `✅ Categories import completed: ${imported} imported, ${errors} errors`
    );

    return NextResponse.json({
      success: true,
      message: "Categories imported successfully",
      stats: {
        total: categories.length,
        imported,
        errors,
      },
    });
  } catch (error) {
    console.error("❌ Error importing categories:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to import categories",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
