"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import ProductCard, { Product } from "@/components/ProductCard";
import Filters, { FilterState } from "@/components/Filters";
import SortDropdown, { SortOption, sortProducts } from "@/components/SortDropdown";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Category {
  id: number;
  name: string;
  parent_id?: number;
  children?: Category[];
}

const ITEMS_PER_PAGE = 24;

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const categorySlug = params?.slug as string;

  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filter and sort state
  const [sortBy, setSortBy] = useState<SortOption>("popularity-desc");
  const [filters, setFilters] = useState<FilterState>({
    priceRange: { min: 0, max: 10000 },
    categories: [],
    brands: [],
    capacityRange: { min: 0, max: 50000 },
    inStockOnly: false,
  });

  // Fetch category and products
  useEffect(() => {
    const fetchCategoryAndProducts = async () => {
      try {
        setLoading(true);

        // First, get all categories to find the one with matching slug
        const categoriesResponse = await fetch("/api/categories");
        const categoriesData = await categoriesResponse.json();

        if (!categoriesData.success) {
          console.error("Error fetching categories:", categoriesData.error);
          return;
        }

        // Find category by slug (convert name to slug)
        const foundCategory = categoriesData.flat.find((cat: Category) => 
          cat.name.toLowerCase().replace(/\s+/g, '-') === categorySlug
        );

        if (!foundCategory) {
          console.error("Category not found:", categorySlug);
          router.push("/");
          return;
        }

        setCategory(foundCategory);

        // Get all child category IDs (including the category itself)
        const getAllChildIds = (cat: Category): number[] => {
          const ids = [cat.id];
          if (cat.children) {
            cat.children.forEach(child => {
              ids.push(...getAllChildIds(child));
            });
          }
          return ids;
        };

        const categoryIds = getAllChildIds(foundCategory);

        // Fetch products for this category
        const productsResponse = await fetch(
          `/api/products?categoryId=${foundCategory.id}&limit=1000`
        );
        const productsData = await productsResponse.json();

        if (productsData.success) {
          setProducts(productsData.products);
          setTotalPages(Math.ceil(productsData.products.length / ITEMS_PER_PAGE));
        }
      } catch (error) {
        console.error("Error fetching category data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (categorySlug) {
      fetchCategoryAndProducts();
    }
  }, [categorySlug, router]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Price filter
      if (
        product.price < filters.priceRange.min ||
        product.price > filters.priceRange.max
      ) {
        return false;
      }

      // Brand filter
      if (filters.brands.length > 0 && !filters.brands.includes(product.brand)) {
        return false;
      }

      // Capacity filter (only for products with capacity > 0)
      if (product.capacity > 0) {
        if (
          product.capacity < filters.capacityRange.min ||
          product.capacity > filters.capacityRange.max
        ) {
          return false;
        }
      }

      // In stock filter
      if (filters.inStockOnly && !product.inStock) {
        return false;
      }

      return true;
    });
  }, [products, filters]);

  const sortedProducts = useMemo(() => {
    const sorted = sortProducts(filteredProducts, sortBy);
    return sorted.sort((a, b) => {
      if (a.inStock && !b.inStock) return -1;
      if (!a.inStock && b.inStock) return 1;
      return 0;
    });
  }, [filteredProducts, sortBy]);

  // Pagination
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return sortedProducts.slice(startIndex, endIndex);
  }, [sortedProducts, currentPage]);

  // Calculate available options for filters
  const availableBrands = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.brand)));
  }, [products]);

  const priceRange = useMemo(() => {
    const prices = products.map((p) => p.price);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [products]);

  const capacityRange = useMemo(() => {
    const capacities = products.map((p) => p.capacity).filter((c) => c > 0);
    return {
      min: capacities.length > 0 ? Math.min(...capacities) : 0,
      max: capacities.length > 0 ? Math.max(...capacities) : 50000,
    };
  }, [products]);

  if (loading) {
    return (
      <Layout>
        <div className="container py-16">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Завантаження...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!category) {
    return (
      <Layout>
        <div className="container py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Категорія не знайдена</h1>
            <Button onClick={() => router.push("/")}>
              Повернутися на головну
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
          <button
            onClick={() => router.push("/")}
            className="hover:text-foreground transition-colors"
          >
            Головна
          </button>
          <span>/</span>
          <span className="text-foreground">{category.name}</span>
        </nav>

        {/* Category Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{category.name}</h1>
          <p className="text-muted-foreground">
            {sortedProducts.length} товарів
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Filters
              filters={filters}
              onFiltersChange={setFilters}
              availableCategories={[]}
              availableBrands={availableBrands}
              priceRange={priceRange}
              capacityRange={capacityRange}
            />
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3 space-y-6">
            {/* Sort and Results Count */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-col gap-2">
                <p className="text-muted-foreground">
                  {sortedProducts.length} товарів
                </p>
              </div>
              <SortDropdown value={sortBy} onValueChange={setSortBy} />
            </div>

            {/* Products Grid */}
            {paginatedProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedProducts.map((product: Product, index) => (
                    <div
                      key={product.id}
                      className="animate-slide-up"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center space-x-2 mt-8">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Попередня
                    </Button>
                    
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(
                          (page) =>
                            page === 1 ||
                            page === totalPages ||
                            (page >= currentPage - 1 && page <= currentPage + 1)
                        )
                        .map((page, index, array) => (
                          <div key={page} className="flex items-center">
                            {index > 0 && array[index - 1] !== page - 1 && (
                              <span className="px-2">...</span>
                            )}
                            <Button
                              variant={currentPage === page ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(page)}
                            >
                              {page}
                            </Button>
                          </div>
                        ))}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Наступна
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16 space-y-4">
                <div className="text-6xl">🔍</div>
                <h3 className="text-xl font-semibold">Товари не знайдено</h3>
                <p className="text-muted-foreground">
                  Спробуйте змінити параметри фільтрації або очистити фільтри
                </p>
                <Button
                  variant="outline"
                  onClick={() =>
                    setFilters({
                      priceRange: {
                        min: priceRange.min,
                        max: priceRange.max,
                      },
                      categories: [],
                      brands: [],
                      capacityRange: {
                        min: capacityRange.min,
                        max: capacityRange.max,
                      },
                      inStockOnly: false,
                    })
                  }
                >
                  Очистити фільтри
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
