import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/client";

// GET /api/products - Get all products with categories
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const categoryId = searchParams.get("categoryId");
    const brand = searchParams.get("brand");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const inStockOnly = searchParams.get("inStockOnly") === "true";
    const searchQuery = searchParams.get("search");

    const supabase = createClient();

    // Базовий запит з JOIN для категорій
    let query = supabase
      .from("products")
      .select(
        `
        *,
        categories!inner(id, name, parent_id)
      `
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // Фільтри
    if (categoryId) {
      query = query.eq("category_id", categoryId);
    }

    if (brand) {
      query = query.eq("brand", brand);
    }

    if (minPrice) {
      query = query.gte("price", parseFloat(minPrice));
    }

    if (maxPrice) {
      query = query.lte("price", parseFloat(maxPrice));
    }

    if (inStockOnly) {
      query = query.gt("quantity", 0);
    }

    if (searchQuery) {
      query = query.or(
        `name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,brand.ilike.%${searchQuery}%`
      );
    }

    const { data: products, error } = await query;

    if (error) {
      console.error("Error fetching products:", error);
      return NextResponse.json(
        { error: "Failed to fetch products" },
        { status: 500 }
      );
    }

    // Отримуємо унікальні категорії з товарів
    const categoryMap = new Map();
    products?.forEach((product) => {
      if (product.categories) {
        categoryMap.set(product.categories.id, {
          id: product.categories.id,
          name: product.categories.name,
          parent_id: product.categories.parent_id,
        });
      }
    });

    const categories = Array.from(categoryMap.values());

    // Конвертуємо товари в потрібний формат
    const convertedProducts =
      products?.map((product) => ({
        id: product.id,
        name: product.name || "",
        description: product.description || "",
        price: product.price || 0,
        originalPrice: undefined,
        image: product.image_url || "",
        images: product.images || [product.image_url || ""],
        rating: 4.5,
        reviewCount: Math.floor(Math.random() * 100) + 10,
        category: product.categories?.name || "Uncategorized",
        brand: product.brand || "Unknown",
        capacity: 0,
        popularity: Math.floor(Math.random() * 100),
        badge: undefined,
        inStock: (product.quantity || 0) > 0,
        createdAt: product.created_at || new Date().toISOString(),
      })) || [];

    return NextResponse.json({
      success: true,
      products: convertedProducts,
      categories: categories,
      pagination: {
        limit,
        offset,
        hasMore: products?.length === limit,
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST /api/products - Create new product
export async function POST(request: NextRequest) {
  try {
    const productData = await request.json();
    const supabase = createClient();

    const { data: product, error } = await supabase
      .from("products")
      .insert([productData])
      .select()
      .single();

    if (error) {
      console.error("Error creating product:", error);
      return NextResponse.json(
        { error: "Failed to create product" },
        { status: 500 }
      );
    }

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
