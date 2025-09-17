import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 Starting price rounding process...");

    // 1. Отримуємо статистику до округлення
    const { data: beforeStats, error: beforeError } = await supabaseAdmin
      .from("products")
      .select("price")
      .not("price", "is", null);

    if (beforeError) {
      throw new Error(`Database error: ${beforeError.message}`);
    }

    const beforeCount = beforeStats?.length || 0;
    const beforeWithCents = beforeStats?.filter(p => p.price !== Math.floor(p.price)).length || 0;
    const beforeMinPrice = Math.min(...(beforeStats?.map(p => p.price) || [0]));
    const beforeMaxPrice = Math.max(...(beforeStats?.map(p => p.price) || [0]));
    const beforeAvgPrice = beforeStats?.reduce((sum, p) => sum + p.price, 0) / beforeCount || 0;

    console.log(`📊 Before rounding: ${beforeCount} products, ${beforeWithCents} with cents`);

    if (beforeWithCents === 0) {
      return NextResponse.json({
        success: true,
        message: "All prices are already rounded to whole numbers",
        stats: {
          total: beforeCount,
          withCents: 0,
          rounded: 0,
          minPrice: beforeMinPrice,
          maxPrice: beforeMaxPrice,
          avgPrice: beforeAvgPrice
        }
      });
    }

    // 2. Округлюємо ціни через SQL запит
    const { data: updateResult, error: updateError } = await supabaseAdmin
      .rpc('round_product_prices');

    if (updateError) {
      // Якщо функція не існує, виконуємо оновлення через звичайний запит
      console.log("📝 Using direct SQL update...");
      
      const { error: directUpdateError } = await supabaseAdmin
        .from("products")
        .update({ 
          price: supabaseAdmin.raw('ROUND(price)'),
          updated_at: new Date().toISOString()
        })
        .neq('price', supabaseAdmin.raw('ROUND(price)'));

      if (directUpdateError) {
        throw new Error(`Update error: ${directUpdateError.message}`);
      }
    }

    // 3. Отримуємо статистику після округлення
    const { data: afterStats, error: afterError } = await supabaseAdmin
      .from("products")
      .select("price")
      .not("price", "is", null);

    if (afterError) {
      throw new Error(`Database error after update: ${afterError.message}`);
    }

    const afterCount = afterStats?.length || 0;
    const afterWithCents = afterStats?.filter(p => p.price !== Math.floor(p.price)).length || 0;
    const afterMinPrice = Math.min(...(afterStats?.map(p => p.price) || [0]));
    const afterMaxPrice = Math.max(...(afterStats?.map(p => p.price) || [0]));
    const afterAvgPrice = afterStats?.reduce((sum, p) => sum + p.price, 0) / afterCount || 0;

    console.log(`✅ After rounding: ${afterCount} products, ${afterWithCents} with cents`);

    // 4. Отримуємо приклади оновлених цін
    const { data: sampleProducts } = await supabaseAdmin
      .from("products")
      .select("external_id, name, price")
      .not("price", "is", null)
      .order("price", { ascending: false })
      .limit(5);

    return NextResponse.json({
      success: true,
      message: `Successfully rounded prices for ${beforeWithCents} products`,
      stats: {
        total: afterCount,
        withCents: afterWithCents,
        rounded: beforeWithCents - afterWithCents,
        minPrice: afterMinPrice,
        maxPrice: afterMaxPrice,
        avgPrice: afterAvgPrice
      },
      beforeStats: {
        total: beforeCount,
        withCents: beforeWithCents,
        minPrice: beforeMinPrice,
        maxPrice: beforeMaxPrice,
        avgPrice: beforeAvgPrice
      },
      sampleProducts: sampleProducts?.map(p => ({
        external_id: p.external_id,
        name: p.name,
        price: p.price
      }))
    });

  } catch (error) {
    console.error("❌ Error rounding prices:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to round prices",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Checking price rounding status...");

    // Отримуємо статистику цін
    const { data: products, error } = await supabaseAdmin
      .from("products")
      .select("price")
      .not("price", "is", null);

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    const total = products?.length || 0;
    const withCents = products?.filter(p => p.price !== Math.floor(p.price)).length || 0;
    const minPrice = Math.min(...(products?.map(p => p.price) || [0]));
    const maxPrice = Math.max(...(products?.map(p => p.price) || [0]));
    const avgPrice = products?.reduce((sum, p) => sum + p.price, 0) / total || 0;

    return NextResponse.json({
      success: true,
      message: "Price rounding status retrieved",
      stats: {
        total,
        withCents,
        rounded: total - withCents,
        minPrice,
        maxPrice,
        avgPrice,
        percentWithCents: total > 0 ? Math.round((withCents / total) * 100) : 0
      }
    });

  } catch (error) {
    console.error("❌ Error checking price status:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to check price status",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
