"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import Layout from "@/components/Layout";
import SortDropdown from "@/components/SortDropdown";
import ProductCard from "@/components/ProductCard";
import Filters, { FilterState } from "@/components/Filters";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ScrollToProductsButton from "@/components/ScrollToProductsButton";
import { useSearch } from "@/context/SearchContext";
import { useFilters } from "@/context/FilterContext";
import { FilterProvider } from "@/context/FilterContext";
import {
  Battery,
  Shield,
  Zap,
  ArrowRight,
  ShoppingBag,
  Truck,
  Headphones,
  Smartphone,
} from "lucide-react";

// Product interface matching the database structure
interface Product {
  id: string;
  external_id?: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  rating: number;
  reviewCount: number;
  inStock: boolean;
  badge?: string;
  capacity: number;
  brand: string;
  popularity: number;
  createdAt: string;
  categories?: {
    id: number;
    name: string;
  };
  category_id?: number;
  vendor_code?: string;
  quantity?: number;
  characteristics?: Record<string, any>;
}

type SortOption =
  | "popularity-desc"
  | "price-asc"
  | "price-desc"
  | "name-asc"
  | "newest-first";

const sortProducts = (products: Product[], sortBy: SortOption): Product[] => {
  const sortedProducts = [...products];

  switch (sortBy) {
    case "price-asc":
      return sortedProducts.sort((a, b) => a.price - b.price);
    case "price-desc":
      return sortedProducts.sort((a, b) => b.price - a.price);
    case "name-asc":
      return sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
    case "newest-first":
      return sortedProducts.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    case "popularity-desc":
    default:
      return sortedProducts.sort((a, b) => b.popularity - a.popularity);
  }
};

export default function Home() {
  console.log("Home component rendering, typeof window:", typeof window);

  // State for products
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [allBrands, setAllBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>("popularity-desc");
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreProducts, setHasMoreProducts] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const prevFilterState = useRef<string>("");

  // Context hooks
  const { searchQuery } = useSearch();
  const { filters, setFilters } = useFilters();

  // Handle URL parameters for category filtering
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get("category");

    if (categoryParam) {
      setFilters((prev) => ({
        ...prev,
        categories: [categoryParam],
      }));

      // Remove the parameter from URL after setting
      const newUrl = window.location.pathname;
      window.history.replaceState({}, "", newUrl);

      // Scroll to products after a short delay
      setTimeout(() => {
        document
          .getElementById("products")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 500);
    }
  }, [setFilters]);

  // Fetch products with filters
  const fetchProducts = useCallback(
    async (
      filterParams?: {
        categoryIds?: string[];
        brandIds?: string[];
        search?: string;
        inStockOnly?: boolean;
        minPrice?: number;
        maxPrice?: number;
      },
      page: number = 1,
      append: boolean = false
    ) => {
      console.log("fetchProducts called with:", { filterParams, page, append });
      try {
        if (append) {
          setLoadingMore(true);
        } else {
          setLoading(true);
        }

        const params = new URLSearchParams();
        if (filterParams?.categoryIds && filterParams.categoryIds.length > 0)
          params.append("categoryIds", filterParams.categoryIds.join(","));
        if (filterParams?.brandIds && filterParams.brandIds.length > 0)
          params.append("brands", filterParams.brandIds.join(","));
        if (filterParams?.search) params.append("search", filterParams.search);
        if (filterParams?.inStockOnly) params.append("inStockOnly", "true");
        if (filterParams?.minPrice)
          params.append("minPrice", filterParams.minPrice.toString());
        if (filterParams?.maxPrice)
          params.append("maxPrice", filterParams.maxPrice.toString());

        // Add pagination parameters
        params.append("limit", "50");
        params.append("offset", ((page - 1) * 50).toString());

        const url = `/api/products?${params.toString()}`;
        console.log("Fetching from URL:", url);
        const response = await fetch(url);
        const data = await response.json();
        console.log("API response:", data);

        if (data.success && data.products) {
          console.log("Setting products:", data.products.length);
          if (append) {
            setAllProducts((prev) => {
              const newProducts = [...prev, ...data.products];
              console.log("Appended products, total:", newProducts.length);
              return newProducts;
            });
          } else {
            setAllProducts(data.products);
            console.log("Set products directly:", data.products.length);
          }

          // Check if there are more products
          setHasMoreProducts(data.products.length === 50);
          setCurrentPage(page);

          console.log("Fetched products:", data.products.length, "Page:", page);
          if (isInitialLoad) {
            setIsInitialLoad(false);
          }
        } else {
          console.error("Failed to fetch products:", data.error);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        if (append) {
          console.log("Setting loadingMore to false");
          setLoadingMore(false);
        } else {
          console.log("Setting loading to false in fetchProducts");
          setLoading(false);
        }
      }
    },
    [isInitialLoad]
  );

  // Set mounted state
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch products on component mount
  useEffect(() => {
    if (!isMounted) return;

    console.log("Component mounted, fetching products...");
    const loadProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/products?limit=50&offset=0");
        const data = await response.json();
        console.log("Initial API response:", data);

        if (data.success && data.products) {
          setAllProducts(data.products);
          setHasMoreProducts(data.products.length === 50);
          setCurrentPage(1);
          console.log("Set initial products:", data.products.length);
        }
      } catch (error) {
        console.error("Error loading initial products:", error);
      } finally {
        console.log("Setting loading to false");
        setLoading(false);
        setIsInitialLoad(false);
      }
    };

    loadProducts();
  }, [isMounted]);

  // Listen for category filter events from header
  useEffect(() => {
    const handleCategoryFilterApplied = (event: CustomEvent) => {
      const { products } = event.detail;
      setAllProducts(products);
      console.log("Updated products from header filter:", products.length);
    };

    window.addEventListener(
      "categoryFilterApplied",
      handleCategoryFilterApplied as EventListener
    );

    return () => {
      window.removeEventListener(
        "categoryFilterApplied",
        handleCategoryFilterApplied as EventListener
      );
    };
  }, []);

  // Load all categories and brands
  const loadAllCategoriesAndBrands = useCallback(async () => {
    try {
      const response = await fetch("/api/products");
      const data = await response.json();

      if (data.success && data.products) {
        // Extract all unique categories
    const categorySet = new Set<string>();
        const brandSet = new Set<string>();

        data.products.forEach((product: Product) => {
      if (product.categories?.name) {
        categorySet.add(product.categories.name);
      }
          if (product.brand) {
            brandSet.add(product.brand);
          }
        });

        setAllCategories(Array.from(categorySet).sort());
        setAllBrands(Array.from(brandSet).sort());

        console.log("Loaded categories:", Array.from(categorySet).length);
        console.log("Loaded brands:", Array.from(brandSet).length);
      }
    } catch (error) {
      console.error("Error loading categories and brands:", error);
    }
  }, []);

  // Load all categories and brands on component mount
  useEffect(() => {
    loadAllCategoriesAndBrands();
  }, [loadAllCategoriesAndBrands]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load more products function
  const loadMoreProducts = async () => {
    if (loadingMore || !hasMoreProducts) return;

    const nextPage = currentPage + 1;
    await fetchProducts({}, nextPage, true);
  };

  // Fetch products when filters change (but not on initial load)
  useEffect(() => {
    // Skip if we haven't loaded initial products yet or if this is initial load
    if (allProducts.length === 0 || isInitialLoad) return;

    // Create a unique string to represent the current filter state
    const currentFilterState = JSON.stringify({
      categories: filters.categories,
      brands: filters.brands,
      inStockOnly: filters.inStockOnly,
      priceRange: filters.priceRange,
      search: debouncedSearchQuery,
    });

    // Skip if the filter state hasn't actually changed
    if (prevFilterState.current === currentFilterState) {
      return;
    }

    // Update the previous filter state
    prevFilterState.current = currentFilterState;

    // Check if we have any active filters
    const hasActiveFilters =
      filters.categories.length > 0 ||
      filters.brands.length > 0 ||
      filters.inStockOnly ||
      filters.priceRange.min > 0 ||
      filters.priceRange.max < 10000 ||
      debouncedSearchQuery;

    console.log("Filter change detected:", {
      hasActiveFilters,
      categories: filters.categories,
      brands: filters.brands,
      search: debouncedSearchQuery,
    });

    // If no active filters, don't do anything - products are already loaded
    if (!hasActiveFilters) {
      console.log("No active filters, keeping current products");
      return;
    }

    // Apply filters
    const applyFilters = async () => {
      const filterParams: any = {};

      // Convert category names to category IDs
      if (filters.categories.length > 0) {
        // Get all products to find category IDs
        try {
          const response = await fetch("/api/products");
          const data = await response.json();

          if (data.success && data.products) {
            const categoryIds: string[] = [];
            filters.categories.forEach((categoryName) => {
              const categoryId = data.products.find(
                (p: Product) => p.categories?.name === categoryName
              )?.category_id;
              if (categoryId) {
                categoryIds.push(categoryId.toString());
              }
            });
            if (categoryIds.length > 0) {
              filterParams.categoryIds = categoryIds;
              console.log(
                "Converted categories to IDs:",
                filters.categories,
                "->",
                categoryIds
              );
            }
          }
        } catch (error) {
          console.error("Error getting category IDs:", error);
        }
      }

      // Add brand filters
      if (filters.brands.length > 0) {
        filterParams.brandIds = filters.brands;
      }

      if (filters.inStockOnly) {
        filterParams.inStockOnly = true;
      }

      if (filters.priceRange.min > 0) {
        filterParams.minPrice = filters.priceRange.min;
      }

      if (filters.priceRange.max < 10000) {
        filterParams.maxPrice = filters.priceRange.max;
      }

      if (debouncedSearchQuery) {
        filterParams.search = debouncedSearchQuery;
      }

      console.log("Applying filters:", filterParams);
      setCurrentPage(1);
      setHasMoreProducts(true);
      await fetchProducts(filterParams, 1, false);
    };

    applyFilters();
  }, [filters, debouncedSearchQuery, isInitialLoad, fetchProducts]);

  // Calculate available options for filters
  const priceRange = useMemo(() => {
    if (allProducts.length === 0) return { min: 0, max: 10000 };
    const prices = allProducts.map((p) => p.price);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }, [allProducts]);

  const capacityRange = useMemo(() => {
    const capacities = allProducts
      .filter((p) => p.capacity && p.capacity > 0)
      .map((p) => p.capacity);

    if (capacities.length === 0) return { min: 0, max: 50000 };

    return {
      min: Math.min(...capacities),
      max: Math.max(...capacities),
    };
  }, [allProducts]);

  // Available categories for filtering (use all categories, not just filtered products)
  const availableCategories = allCategories;

  // Available brands for filtering (use all brands, not just filtered products)
  const availableBrands = allBrands;

  // Sort products (server-side filtering is now handled by API)
  const filteredAndSortedProducts = useMemo(() => {
    console.log("Sorting products:", allProducts.length, "sortBy:", sortBy);
    console.log("allProducts sample:", allProducts.slice(0, 2));
    const sorted = sortProducts(allProducts, sortBy);
    console.log("Final products count:", sorted.length);
    return sorted;
  }, [allProducts, sortBy]);

  const scrollToProducts = () => {
    document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
  };

  const getCategorySlug = (categoryName: string) => {
    return categoryName.toLowerCase().replace(/\s+/g, "-");
  };

  const getCategoryIcon = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (
      name.includes("акумулятор") ||
      name.includes("powerbank") ||
      name.includes("батареї")
    ) {
      return Battery;
    } else if (
      name.includes("зарядки") ||
      name.includes("кабелі") ||
      name.includes("адаптер")
    ) {
      return Zap;
    } else if (name.includes("навушники")) {
      return Headphones;
    } else {
      return Smartphone;
    }
  };

  // Handle category button clicks
  const handleCategoryClick = async (
    categoryName: string,
    e?: React.MouseEvent | React.TouchEvent
  ) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    console.log("Category button clicked:", categoryName);

    // Set category filter
    setFilters((prev) => ({
      ...prev,
      categories: [categoryName],
    }));

    // Apply category filter via API (same as header logic)
    try {
      // First fetch all products to get category ID
      const response = await fetch("/api/products");
      const data = await response.json();

      if (data.success && data.products) {
        const categoryId = data.products.find(
          (p: Product) => p.categories?.name === categoryName
        )?.category_id;

        if (categoryId) {
          console.log(
            "Header filtering by category:",
            categoryName,
            "ID:",
            categoryId
          );
          // Apply filter via API
          const filterResponse = await fetch(
            `/api/products?categoryId=${categoryId}`
          );
          const filterData = await filterResponse.json();

          if (filterData.success && filterData.products) {
            setAllProducts(filterData.products);
            setCurrentPage(1);
            setHasMoreProducts(filterData.products.length === 50);
          }
        }
      }
    } catch (error) {
      console.error("Error applying category filter:", error);
    }

    // Scroll to products section
    scrollToProducts();
  };

  return (
    <FilterProvider>
    <Layout>
        <div className="min-h-screen">
          {/* Hero Section - previous good design */}
      <section className="relative hero-gradient text-white overflow-hidden">
            <div className="absolute inset-0 bg-black/20 pointer-events-none"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse pointer-events-none"></div>
            <div className="relative z-10 container py-24 md:py-32">
          <div className="max-w-3xl mx-auto text-center space-y-8 animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight animate-slide-up">
              Залишайтесь на Зв'язку Під Час Будь-якого Блекауту
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 leading-relaxed animate-slide-up-delay">
                  Купуйте павербанки, зарядні пристрої та кабелі, щоб залишатися
                  на зв'язку, коли це найбільш важливо. Ніколи не дозволяйте
                  відключенню електроенергії застати вас зненацька.
            </p>
            <div className="flex justify-center animate-slide-up-delay-2">
              <Button
                size="lg"
                onClick={scrollToProducts}
                    className="bg-white text-blue-700 hover:bg-gray-100 hover:scale-105 text-lg px-8 py-6 transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer"
              >
                    Купити Зараз
              </Button>
            </div>
          </div>
        </div>
      </section>

          {/* Features Section - previous good design */}
          <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  {
                    icon: Battery,
                    title: "Довготривала Робота",
                    description:
                      "Потужні батареї, які забезпечують роботу протягом днів",
                  },
                  {
                    icon: Zap,
                    title: "Швидка Зарядка",
                    description:
                      "Технологія швидкої зарядки повертає 100% заряду миттєво",
                  },
                  {
                    icon: Shield,
                    title: "Безпека та Надійність",
                    description:
                      "Вбудовані функції безпеки захищають ваші пристрої від пошкоджень",
                  },
                  {
                    icon: Truck,
                    title: "Швидка Доставка",
                    description:
                      "Відправлення в день замовлення по всій Україні",
                  },
                ].map((feature, index) => (
              <div
                key={index}
                    className="text-center space-y-4 group hover:scale-105 transition-transform duration-300"
                    style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="mx-auto w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-700 group-hover:rotate-6 transition-all duration-300">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                    <h3 className="font-semibold text-lg group-hover:text-blue-600 transition-colors duration-300">
                  {feature.title}
                </h3>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
          <section className="py-16 bg-white">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Категорії Товарів
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Оберіть категорію, яка вас цікавить
            </p>
          </div>

              <div className="flex justify-center">
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 max-w-4xl">
                {availableCategories.map((category, index) => {
                  const Icon = getCategoryIcon(category);
              return (
                <div
                      key={category}
                      className="group relative bg-white border-2 border-gray-100 rounded-2xl p-6 hover:border-blue-200 hover:shadow-lg transition-all duration-300 cursor-pointer"
                      onClick={(e) => handleCategoryClick(category, e)}
                    >
                      <div className="flex flex-col items-center text-center space-y-4">
                        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Icon className="w-8 h-8 text-white" />
                    </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-300 text-sm lg:text-base">
                            {category}
                    </h3>
                        </div>
                  </div>
                </div>
              );
            })}
                </div>
              </div>
            </div>
          </section>

      {/* Products Section */}
          <section id="products" className="py-16 bg-gray-50">
        <div className="container">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 space-y-4 lg:space-y-0">
                <div>
                  <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                    Наші товари
                  </h2>
                  <p className="text-gray-600">
                    {loading
                      ? "Завантаження..."
                      : `Знайдено ${filteredAndSortedProducts.length} товарів`}
            </p>
          </div>

                <div className="flex items-center gap-4">
              <SortDropdown value={sortBy} onValueChange={setSortBy} />
            </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                {/* Filters Sidebar */}
                <div className="xl:col-span-1">
                  <Filters
                    filters={filters}
                    onFiltersChange={() => {}} // Use FilterContext instead
                    availableCategories={availableCategories}
                    availableBrands={availableBrands}
                    priceRange={priceRange}
                    capacityRange={capacityRange}
                    onApplyFilters={fetchProducts}
                  />
          </div>

          {/* Products Grid */}
                <div className="xl:col-span-3">
          {loading ? (
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                      {Array.from({ length: 6 }).map((_, index) => (
                        <div
                          key={index}
                          className="bg-white rounded-lg p-4 animate-pulse"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <div className="aspect-square bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg mb-4 animate-pulse" />
                          <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded mb-2 animate-pulse" />
                          <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-3/4 animate-pulse" />
              </div>
                      ))}
            </div>
                  ) : filteredAndSortedProducts.length > 0 ? (
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {filteredAndSortedProducts.map((product, index) => (
                <div
                  key={product.id}
                          className="animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                          <ProductCard
                            product={{
                              ...product,
                              category:
                                product.categories?.name || "Uncategorized",
                            }}
                          />
                </div>
              ))}
            </div>
                  ) : (
                    <div className="text-center py-16">
                      <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShoppingBag className="w-12 h-12 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Товари не знайдені
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Спробуйте змінити фільтри або пошуковий запит
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => window.location.reload()}
                        className="cursor-pointer"
                      >
                        Оновити сторінку
                      </Button>
                    </div>
                  )}

                  {/* Load More Button */}
                  {hasMoreProducts && !loading && (
                    <div className="col-span-full flex justify-center mt-8">
                      <Button
                        onClick={loadMoreProducts}
                        disabled={loadingMore}
                        className="px-8 py-3 text-lg"
                      >
                        {loadingMore ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Завантаження...
                          </>
                        ) : (
                          "Завантажити ще"
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
        </div>
      </section>

      {/* CTA Section */}
          <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
            <div className="container">
              <div className="text-center text-white">
                <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Готові Забезпечити Безперебійну Роботу?
          </h2>
                <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                  Оберіть найкращі рішення для зарядки та підтримки ваших
                  пристроїв під час будь-яких обставин
                </p>
            <Button
              size="lg"
              onClick={scrollToProducts}
                  className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold cursor-pointer"
                >
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Переглянути каталог
            </Button>
          </div>
        </div>
      </section>

          {/* Scroll to Products Button */}
          <ScrollToProductsButton />
        </div>
    </Layout>
    </FilterProvider>
  );
}
