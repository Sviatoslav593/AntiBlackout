import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Checking products without external_id...");

    // Перевіряємо товари без external_id
    const { data: productsWithoutExternalId, error: noExternalIdError } = await supabaseAdmin
      .from("products")
      .select("id, external_id, name, category_id")
      .is("external_id", null);

    if (noExternalIdError) {
      console.error("❌ Error checking products without external_id:", noExternalIdError);
      return NextResponse.json({ success: false, error: noExternalIdError.message });
    }

    // Перевіряємо товари з порожнім external_id
    const { data: productsWithEmptyExternalId, error: emptyExternalIdError } = await supabaseAdmin
      .from("products")
      .select("id, external_id, name, category_id")
      .eq("external_id", "");

    if (emptyExternalIdError) {
      console.error("❌ Error checking products with empty external_id:", emptyExternalIdError);
      return NextResponse.json({ success: false, error: emptyExternalIdError.message });
    }

    // Отримуємо загальну кількість товарів
    const { count: totalCount, error: totalError } = await supabaseAdmin
      .from("products")
      .select("*", { count: "exact", head: true });

    if (totalError) {
      console.error("❌ Error getting total count:", totalError);
      return NextResponse.json({ success: false, error: totalError.message });
    }

    console.log(`📊 Found ${productsWithoutExternalId?.length || 0} products without external_id`);
    console.log(`📊 Found ${productsWithEmptyExternalId?.length || 0} products with empty external_id`);
    console.log(`📊 Total products: ${totalCount}`);

    return NextResponse.json({
      success: true,
      stats: {
        totalProducts: totalCount || 0,
        withoutExternalId: productsWithoutExternalId?.length || 0,
        withEmptyExternalId: productsWithEmptyExternalId?.length || 0,
        withValidExternalId: (totalCount || 0) - (productsWithoutExternalId?.length || 0) - (productsWithEmptyExternalId?.length || 0)
      },
      productsWithoutExternalId: productsWithoutExternalId?.slice(0, 10) || [],
      productsWithEmptyExternalId: productsWithEmptyExternalId?.slice(0, 10) || []
    });

  } catch (error) {
    console.error("❌ Unexpected error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
