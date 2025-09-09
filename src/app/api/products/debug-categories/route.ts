import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { parseXMLFeed } from "@/lib/xmlParser";

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Debugging category assignment...");

    // Отримуємо XML дані
    const products = await parseXMLFeed("https://mma.in.ua/feed/xml/iDxAyRECF.xml");
    console.log(`📦 Parsed ${products.length} products from XML feed`);

    // Отримуємо товари з бази даних
    const { data: dbProducts, error: dbError } = await supabaseAdmin
      .from("products")
      .select("id, external_id, name, category_id")
      .limit(10);

    if (dbError) {
      console.error("❌ Error fetching products:", dbError);
      return NextResponse.json({ success: false, error: dbError.message });
    }

    console.log(`📊 Found ${dbProducts?.length || 0} products in database`);

    // Перевіряємо перші кілька товарів
    const sampleProducts = dbProducts?.slice(0, 5) || [];
    const sampleXmlProducts = products.slice(0, 5);

    const debugInfo = sampleProducts.map(dbProduct => {
      const xmlProduct = products.find(p => p.external_id === dbProduct.external_id);
      return {
        dbProduct: {
          id: dbProduct.id,
          external_id: dbProduct.external_id,
          name: dbProduct.name,
          category_id: dbProduct.category_id
        },
        xmlProduct: xmlProduct ? {
          external_id: xmlProduct.external_id,
          name: xmlProduct.name,
          category_id: xmlProduct.category_id
        } : null,
        match: !!xmlProduct
      };
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalXmlProducts: products.length,
        totalDbProducts: dbProducts?.length || 0,
        sampleSize: sampleProducts.length
      },
      debugInfo,
      sampleXmlProducts: sampleXmlProducts.map(p => ({
        external_id: p.external_id,
        name: p.name,
        category_id: p.category_id
      }))
    });

  } catch (error) {
    console.error("❌ Unexpected error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
