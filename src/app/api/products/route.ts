import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/client";

// GET /api/products - Get all products with categories
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!)
      : undefined;
    const offset = parseInt(searchParams.get("offset") || "0");
    const categoryId = searchParams.get("categoryId");
    const categoryIds = searchParams.get("categoryIds");
    const brand = searchParams.get("brand");
    const brands = searchParams.get("brands");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const inStockOnly = searchParams.get("inStockOnly") === "true";
    const searchQuery = searchParams.get("search");
    
    // USB Cable characteristics filters
    const inputConnector = searchParams.get("inputConnector");
    const outputConnector = searchParams.get("outputConnector");
    const cableLength = searchParams.get("cableLength");

    const supabase = createClient();

    // Якщо вказано ліміт, використовуємо звичайний запит
    if (limit) {
      let query = supabase
        .from("products")
        .select(
          `
          *,
          categories(id, name)
        `
        )
        .order("created_at", { ascending: false })
        .limit(limit);

      // Фільтри
      if (categoryId) {
        query = query.eq("category_id", categoryId);
      } else if (categoryIds) {
        const categoryIdArray = categoryIds
          .split(",")
          .map((id) => parseInt(id.trim()));
        query = query.in("category_id", categoryIdArray);
      }

      if (brand) {
        query = query.eq("brand", brand);
      } else if (brands) {
        const brandArray = brands.split(",").map((b) => b.trim());
        query = query.in("brand", brandArray);
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

      // USB Cable characteristics filters
      if (inputConnector) {
        query = query.filter('characteristics->>Вхід (Тип коннектора)', 'ilike', `%${inputConnector}%`);
      }
      if (outputConnector) {
        query = query.filter('characteristics->>Вихід (Тип коннектора)', 'ilike', `%${outputConnector}%`);
      }
      if (cableLength) {
        query = query.filter('characteristics->>Довжина кабелю, м', 'ilike', `%${cableLength}%`);
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
          external_id: product.external_id,
          name: product.name || "",
          description: product.description || "",
          price: product.price || 0,
          originalPrice: undefined,
          image: product.image_url || "",
          images: product.images || [product.image_url || ""],
          rating: 4.5,
          reviewCount: Math.floor(Math.random() * 100) + 10,
          category: product.categories?.name || "Uncategorized",
          category_id: product.category_id,
          categories: product.categories,
          brand: product.brand || "Unknown",
          capacity: 0,
          popularity: Math.floor(Math.random() * 100),
          badge: undefined,
          inStock: (product.quantity || 0) > 0,
          createdAt: product.created_at || new Date().toISOString(),
          vendor_code: product.vendor_code,
          quantity: product.quantity,
          characteristics: product.characteristics,
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
    }

    // Якщо ліміт не вказано, отримуємо всі товари через пагінацію
    let allProducts: any[] = [];
    let currentOffset = 0;
    const batchSize = 1000;
    let hasMore = true;

    while (hasMore) {
      let query = supabase
        .from("products")
        .select(
          `
          *,
          categories(id, name)
        `
        )
        .order("created_at", { ascending: false })
        .range(currentOffset, currentOffset + batchSize - 1);

      // Фільтри
      if (categoryId) {
        query = query.eq("category_id", categoryId);
      } else if (categoryIds) {
        const categoryIdArray = categoryIds
          .split(",")
          .map((id) => parseInt(id.trim()));
        query = query.in("category_id", categoryIdArray);
      }

      if (brand) {
        query = query.eq("brand", brand);
      } else if (brands) {
        const brandArray = brands.split(",").map((b) => b.trim());
        query = query.in("brand", brandArray);
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

      // USB Cable characteristics filters
      if (inputConnector) {
        query = query.filter('characteristics->>Вхід (Тип коннектора)', 'ilike', `%${inputConnector}%`);
      }
      if (outputConnector) {
        query = query.filter('characteristics->>Вихід (Тип коннектора)', 'ilike', `%${outputConnector}%`);
      }
      if (cableLength) {
        query = query.filter('characteristics->>Довжина кабелю, м', 'ilike', `%${cableLength}%`);
      }

      const { data: batchProducts, error } = await query;

      if (error) {
        console.error("Error fetching products batch:", error);
        return NextResponse.json(
          { error: "Failed to fetch products" },
          { status: 500 }
        );
      }

      if (batchProducts && batchProducts.length > 0) {
        allProducts = allProducts.concat(batchProducts);
        currentOffset += batchSize;
        hasMore = batchProducts.length === batchSize;
      } else {
        hasMore = false;
      }
    }

    const products = allProducts;

    // Отримуємо унікальні категорії з товарів
    const categoryMap = new Map();
    products?.forEach((product) => {
      if (product.categories) {
        categoryMap.set(product.categories.id, {
          id: product.categories.id,
          name: product.categories.name,
        });
      }
    });

    const categories = Array.from(categoryMap.values());

    // Конвертуємо товари в потрібний формат
    const convertedProducts =
      products?.map((product) => ({
        id: product.id,
        external_id: product.external_id,
        name: product.name || "",
        description: product.description || "",
        price: product.price || 0,
        originalPrice: undefined,
        image: product.image_url || "",
        images: product.images || [product.image_url || ""],
        rating: 4.5,
        reviewCount: Math.floor(Math.random() * 100) + 10,
        category: product.categories?.name || "Uncategorized",
        category_id: product.category_id,
        categories: product.categories,
        brand: product.brand || "Unknown",
        capacity: 0,
        popularity: Math.floor(Math.random() * 100),
        badge: undefined,
        inStock: (product.quantity || 0) > 0,
        createdAt: product.created_at || new Date().toISOString(),
        vendor_code: product.vendor_code,
        quantity: product.quantity,
        characteristics: product.characteristics,
      })) || [];

    return NextResponse.json({
      success: true,
      products: convertedProducts,
      categories: categories,
      pagination: {
        limit: null,
        offset: 0,
        hasMore: false,
        total: products.length,
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
