"use client";

import { useEffect, useMemo, useState, useCallback, useRef, memo } from "react";
import Image from "next/image";
import Link from "next/link";
import SortDropdown from "@/components/SortDropdown";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ScrollToProductsButton from "@/components/ScrollToProductsButton";
import FiltersSPA from "@/components/FiltersSPA";
import { useUrlFilters } from "@/hooks/useUrlFilters";
import { useProductStore, FilterParams } from "@/store/productStore";
import SearchSync from "@/components/SearchSync";
import {
  Battery,
  Shield,
  Zap,
  ArrowRight,
  ShoppingBag,
  Headphones,
  Smartphone,
  Filter,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const features = [
  {
    icon: Battery,
    title: "Потужні павербанки",
    description: "Високоякісні портативні батареї для всіх ваших пристроїв",
  },
  {
    icon: Shield,
    title: "Захист від блекаутів",
    description: "Ніколи не залишайтеся без зв'язку під час відключень світла",
  },
  {
    icon: Zap,
    title: "Швидка зарядка",
    description: "Технології швидкої зарядки для мінімального часу очікування",
  },
];

const stats = [
  { label: "Задоволених клієнтів", value: "10,000+" },
  { label: "Проданих пристроїв", value: "50,000+" },
  { label: "Років на ринку", value: "5+" },
  { label: "Гарантія якості", value: "100%" },
];

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
  capacity?: number;
  brand: string;
  popularity?: number;
  createdAt: string;
  category?: string;
  categoryId?: string;
  category_id?: number;
  vendor_code?: string;
  quantity?: number;
  characteristics?: Record<string, any>;
  categories?: {
    id: number;
    name: string;
    parent_id?: number;
  };
}

type SortOption =
  | "popularity-desc"
  | "price-asc"
  | "price-desc"
  | "name-asc"
  | "name-desc"
  | "rating-desc"
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
      return sortedProducts.sort(
        (a, b) => (b.popularity || 0) - (a.popularity || 0)
      );
  }
};

const HomePageClient = memo(function HomePageClient() {
  // State for products
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [allBrands, setAllBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>("popularity-desc");
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  // Remove visibleCount - use currentPage from store instead
  const [currentMobileFilters, setCurrentMobileFilters] =
    useState<FilterParams | null>(null);
  const prevFilterState = useRef<string>("");

  // Allow scrolling when mobile filters are open (simplified approach)
  // No need to block scrolling - let users scroll naturally

  // Debug logging for categories and brands
  useEffect(() => {
    console.log(
      "HomePageClient - allCategories:",
      allCategories,
      "length:",
      allCategories?.length,
      "type:",
      typeof allCategories
    );
    console.log(
      "HomePageClient - allBrands:",
      allBrands,
      "length:",
      allBrands?.length,
      "type:",
      typeof allBrands
    );

    // Check if data is being passed to FiltersSPA
    console.log("HomePageClient - Passing to FiltersSPA:", {
      availableCategories: allCategories || [],
      availableBrands: allBrands || [],
      categoriesLength: (allCategories || []).length,
      brandsLength: (allBrands || []).length,
    });
  }, [allCategories, allBrands]);

  // No fallback data - only real data from database

  // Context hooks
  const { activeFilters, applyFiltersAndUpdateUrl, clearFilters } =
    useUrlFilters();
  const {
    filteredProducts,
    usbFilterOptions,
    currentPage,
    hasMoreProducts,
    isLoadingMore,
    loadMoreProducts,
    clearAllData,
  } = useProductStore();

  // Load products, categories, and brands on mount (only if not already loaded)
  useEffect(() => {
    console.log("HomePageClient useEffect: Starting data loading");
    const loadData = async () => {
      try {
        setLoading(true);

        // Check if products are already loaded in store
        const storeProducts = useProductStore.getState().allProducts;
        console.log("Store products check:", storeProducts?.length || 0);
        if (storeProducts && storeProducts.length > 0) {
          console.log(
            "Using cached products from store:",
            storeProducts.length
          );
          setAllProducts(storeProducts as Product[]);
        } else {
          // Load products from all categories only if not cached
          console.log("Loading products from API...");
          const productsResponse = await fetch("/api/products?limit=10000");
          const productsData = await productsResponse.json();

          if (productsData.success && productsData.products) {
            console.log(
              "Loaded products from API:",
              productsData.products.length
            );
            console.log("First product structure:", productsData.products[0]);
            setAllProducts(productsData.products);
            useProductStore.getState().setProducts(productsData.products);
          }
        }

        // Load categories (check cache first)
        const storeCategories = useProductStore.getState().categories;
        console.log("Store categories check:", storeCategories?.length || 0);
        if (storeCategories && storeCategories.length > 0) {
          console.log("Using cached categories from store:", storeCategories);
          setAllCategories(storeCategories);
        } else {
          console.log("Loading categories from API...");
          try {
            const categoriesResponse = await fetch("/api/categories");
            console.log(
              "Categories response status:",
              categoriesResponse.status
            );

            if (!categoriesResponse.ok) {
              throw new Error(
                `Categories API failed: ${categoriesResponse.status}`
              );
            }

            const categoriesData = await categoriesResponse.json();
            console.log("Categories API response:", categoriesData);

            if (
              categoriesData.success &&
              categoriesData.flat &&
              categoriesData.flat.length > 0
            ) {
              // Use flat categories array which contains all categories
              const categoryNames = categoriesData.flat.map(
                (cat: any) => cat.name
              );
              console.log("Category names from flat:", categoryNames);
              setAllCategories(categoryNames);
              useProductStore.getState().setCategories(categoryNames);
              console.log("Categories set in state:", categoryNames);
            } else if (
              categoriesData.categories &&
              categoriesData.categories.length > 0
            ) {
              // Try alternative structure
              console.log(
                "Trying alternative categories structure:",
                categoriesData.categories
              );
              const categoryNames = categoriesData.categories.map(
                (cat: any) => cat.name || cat
              );
              console.log("Alternative category names:", categoryNames);
              setAllCategories(categoryNames);
              useProductStore.getState().setCategories(categoryNames);
              console.log(
                "Categories set in state (alternative):",
                categoryNames
              );
            } else {
              console.log("Categories API returned empty data");
              setAllCategories([]);
              useProductStore.getState().setCategories([]);
            }
          } catch (error) {
            console.error("Error loading categories:", error);
            setAllCategories([]);
            useProductStore.getState().setCategories([]);
          }
        }

        // Load brands (check cache first)
        const storeBrands = useProductStore.getState().brands;
        console.log("Store brands check:", storeBrands?.length || 0);
        if (storeBrands && storeBrands.length > 0) {
          console.log("Using cached brands from store:", storeBrands);
          setAllBrands(storeBrands);
        } else {
          console.log("Loading brands from API...");
          try {
            const brandsResponse = await fetch("/api/brands");
            console.log("Brands response status:", brandsResponse.status);

            if (!brandsResponse.ok) {
              throw new Error(`Brands API failed: ${brandsResponse.status}`);
            }

            const brandsData = await brandsResponse.json();
            console.log("Brands API response:", brandsData);

            if (
              brandsData.success &&
              brandsData.brands &&
              brandsData.brands.length > 0
            ) {
              console.log("Brand names:", brandsData.brands);
              setAllBrands(brandsData.brands);
              useProductStore.getState().setBrands(brandsData.brands);
              console.log("Brands set in state:", brandsData.brands);
            } else if (brandsData.brands && brandsData.brands.length > 0) {
              // Try alternative structure
              console.log(
                "Trying alternative brands structure:",
                brandsData.brands
              );
              const brandNames = brandsData.brands.map(
                (brand: any) => brand.name || brand
              );
              console.log("Alternative brand names:", brandNames);
              setAllBrands(brandNames);
              useProductStore.getState().setBrands(brandNames);
            } else {
              console.log("Brands API returned empty data");
              setAllBrands([]);
              useProductStore.getState().setBrands([]);
            }
          } catch (error) {
            console.error("Error loading brands:", error);
            setAllBrands([]);
            useProductStore.getState().setBrands([]);
          }
        }
      } catch (error) {
        console.error("Error loading data:", error);
        setAllCategories([]);
        setAllBrands([]);
        useProductStore.getState().setCategories([]);
        useProductStore.getState().setBrands([]);
      } finally {
        setLoading(false);
        console.log("HomePageClient useEffect: Data loading completed");
        console.log("HomePageClient - USB filter options:", usbFilterOptions);
        console.log("HomePageClient - Pagination state:", {
          currentPage,
          hasMoreProducts,
          isLoadingMore,
          totalProducts: (filteredProducts || allProducts).length,
          visibleProducts: currentPage * 50,
        });
      }
    };

    loadData();
  }, []);

  // Handle category filter from header
  useEffect(() => {
    const handleCategoryFilterApplied = (event: CustomEvent) => {
      const { categoryId, categoryName } = event.detail;
      console.log(
        "Category filter applied from header:",
        categoryId,
        categoryName
      );

      // Apply category filter
      const newFilters = {
        ...activeFilters,
        categoryIds: [categoryId],
      };

      applyFiltersAndUpdateUrl(newFilters);
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
  }, [activeFilters, applyFiltersAndUpdateUrl]);

  // Sort products and apply local pagination
  const sortedProducts = useMemo(() => {
    // If no filters are applied, use allProducts; otherwise use filteredProducts
    const hasActiveFilters =
      (activeFilters.categoryIds?.length || 0) > 0 ||
      (activeFilters.brandIds?.length || 0) > 0 ||
      (activeFilters.search?.trim() || "") !== "" ||
      (activeFilters.minPrice || 0) > 0 ||
      (activeFilters.maxPrice || 10000) < 10000 ||
      (activeFilters.minCapacity || 0) > 0 ||
      (activeFilters.maxCapacity || 50000) < 50000 ||
      activeFilters.inStockOnly ||
      false;

    const products = hasActiveFilters
      ? [...(filteredProducts || [])]
      : [...allProducts];

    // Debug logging
    console.log("HomePageClient sortedProducts:", {
      filteredProducts: filteredProducts?.length,
      allProducts: allProducts.length,
      usingFiltered: hasActiveFilters,
      hasActiveFilters,
      activeFilters,
      currentPage,
      maxItems: currentPage * 50,
    });

    let sorted = products;
    switch (sortBy) {
      case "price-asc":
        sorted = products.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        sorted = products.sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        sorted = products.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        sorted = products.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "rating-desc":
        sorted = products.sort((a, b) => b.rating - a.rating);
        break;
      case "popularity-desc":
      default:
        sorted = products.sort(
          (a, b) => (b.reviewCount || 0) - (a.reviewCount || 0)
        );
        break;
    }

    // Apply pagination based on currentPage from store
    const itemsPerPage = 50;
    const maxItems = currentPage * itemsPerPage;
    return sorted.slice(0, maxItems);
  }, [filteredProducts, allProducts, sortBy, activeFilters, currentPage]);

  // Handle sort change
  const handleSortChange = (newSort: string) => {
    setSortBy(newSort as any);
  };

  // Handle load more products (store pagination)
  const handleLoadMore = useCallback(() => {
    loadMoreProducts();
  }, [loadMoreProducts]);

  // Pagination is now handled by currentPage from store

  // Handle scroll to products
  const handleScrollToProducts = () => {
    const productsSection = document.getElementById("products");
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Clear all filters
  const handleClearFilters = () => {
    clearFilters();
  };

  return (
    <>
      <SearchSync />
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] animate-hero-fade-in" />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-transparent to-purple-600/20 animate-hero-fade-in" />

        <div className="container relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight animate-hero-slide-up">
              Ніколи не залишайтеся без{" "}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                енергії
              </span>
            </h1>
            <p className="text-xl lg:text-2xl text-gray-300 mb-8 leading-relaxed animate-hero-slide-up-delay">
              Потужні павербанки та якісні кабелі для захисту від блекаутів.
              Швидка доставка по всій Україні.
            </p>
            <div className="flex justify-center animate-hero-slide-up-delay-2">
              <Button
                size="lg"
                onClick={handleScrollToProducts}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-2xl hover:shadow-blue-500/25 transform transition-all duration-300 hover:scale-105 hover:-translate-y-1"
              >
                Переглянути товари <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Floating elements with modern animation */}
        <div className="absolute top-20 left-10 animate-hero-float">
          <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-blue-400/30">
            <Battery className="h-8 w-8 text-blue-400" />
          </div>
        </div>
        <div className="absolute top-40 right-20 animate-hero-float-delay">
          <div className="w-12 h-12 bg-yellow-500/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-yellow-400/30">
            <Zap className="h-6 w-6 text-yellow-400" />
          </div>
        </div>
        <div className="absolute bottom-20 left-20 animate-hero-float-delay-2">
          <div className="w-14 h-14 bg-green-500/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-green-400/30">
            <Shield className="h-7 w-7 text-green-400" />
          </div>
        </div>
        <div className="absolute top-1/2 right-10 animate-hero-float">
          <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-purple-400/30">
            <Zap className="h-5 w-5 text-purple-400" />
          </div>
        </div>
        <div className="absolute bottom-40 right-1/4 animate-hero-float-delay">
          <div className="w-12 h-12 bg-cyan-500/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-cyan-400/30">
            <Battery className="h-6 w-6 text-cyan-400" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-3xl lg:text-4xl font-bold text-blue-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="container">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Чому обирають нас
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Ми пропонуємо найкращі рішення для захисту від блекаутів
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 animate-slide-up"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                  <feature.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-16 bg-gray-50">
        <div className="container">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 space-y-4 lg:space-y-0">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                Товари
              </h2>
              <p className="text-gray-600">
                {loading
                  ? "Завантаження..."
                  : `Знайдено ${sortedProducts.length} товарів`}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <SortDropdown value={sortBy} onValueChange={handleSortChange} />
              <Button
                onClick={() => {
                  clearAllData();
                  window.location.reload();
                }}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                Очистити кеш
              </Button>
            </div>
          </div>

          {/* Mobile Filters Button */}
          <div className="lg:hidden mb-4">
            <Button
              onClick={() => setIsMobileFiltersOpen(true)}
              className="w-full"
              variant="outline"
            >
              <Filter className="w-4 h-4 mr-2" />
              Фільтри
            </Button>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Desktop Filters Sidebar */}
            <div className="hidden lg:block lg:w-1/4">
              <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
                <FiltersSPA
                  availableCategories={allCategories || []}
                  availableBrands={allBrands || []}
                  priceRange={{ min: 0, max: 10000 }}
                  capacityRange={{ min: 0, max: 50000 }}
                />
              </div>
            </div>

            {/* Mobile Filters Overlay */}
            <AnimatePresence>
              {isMobileFiltersOpen && (
                <div className="fixed inset-0 z-[9999] lg:hidden">
                  <motion.div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    onClick={() => setIsMobileFiltersOpen(false)}
                  />
                  <motion.div
                    className="fixed left-0 top-0 h-full w-4/5 max-w-sm bg-white shadow-2xl overflow-visible"
                    initial={{ x: "-100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "-100%" }}
                    transition={{
                      type: "spring",
                      damping: 30,
                      stiffness: 300,
                      duration: 0.3,
                    }}
                  >
                    <div className="h-full flex flex-col">
                      {/* Header with close button */}
                      <div className="flex items-center justify-between p-4 border-b bg-white sticky top-0 z-10">
                        <h3 className="text-xl font-semibold text-gray-900">
                          Фільтри
                        </h3>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={clearFilters}
                            className="text-sm"
                          >
                            Очистити
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsMobileFiltersOpen(false)}
                            className="p-2 hover:bg-gray-100 rounded-full"
                          >
                            <X className="w-5 h-5" />
                          </Button>
                        </div>
                      </div>

                      {/* Scrollable content */}
                      <div className="flex-1 overflow-y-auto overflow-x-visible p-4 pb-16">
                        <FiltersSPA
                          availableCategories={allCategories || []}
                          availableBrands={allBrands || []}
                          priceRange={{ min: 0, max: 10000 }}
                          capacityRange={{ min: 0, max: 50000 }}
                          isMobile={true}
                          onMobileClose={() => setIsMobileFiltersOpen(false)}
                          onFiltersChange={setCurrentMobileFilters}
                        />
                      </div>

                      {/* Fixed bottom button - always visible */}
                      <div className="p-4 border-t bg-white sticky bottom-0 z-20">
                        <Button
                          onClick={() => {
                            // Apply filters and close modal
                            const filtersToApply =
                              currentMobileFilters || activeFilters;
                            console.log(
                              "Mobile: Applying filters:",
                              filtersToApply
                            );
                            console.log(
                              "Mobile: currentMobileFilters:",
                              currentMobileFilters
                            );
                            console.log(
                              "Mobile: activeFilters:",
                              activeFilters
                            );
                            applyFiltersAndUpdateUrl(filtersToApply);
                            setIsMobileFiltersOpen(false);
                          }}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                          size="lg"
                        >
                          Застосувати фільтри
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* Products Grid */}
            <div className="lg:w-3/4">
              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-lg shadow-lg p-6 animate-pulse"
                    >
                      <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                      <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : sortedProducts.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedProducts.map((product) => (
                      <ProductCard
                        key={`${product.id}-${product.name}-${product.price}`}
                        product={{
                          ...product,
                          category: product.category || "Інше",
                        }}
                      />
                    ))}
                  </div>

                  {/* Load More Button - Show if there are more products to load */}
                  {hasMoreProducts && (
                    <div className="text-center mt-12">
                      <Button
                        onClick={handleLoadMore}
                        disabled={isLoadingMore}
                        size="lg"
                        className="px-8"
                      >
                        {isLoadingMore
                          ? "Завантаження..."
                          : `Завантажити ще (${sortedProducts.length} товарів)`}
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Товари не знайдено
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Спробуйте змінити фільтри або очистити їх
                  </p>
                  <Button onClick={handleClearFilters} variant="outline">
                    Очистити фільтри
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="container">
          <div className="text-center text-white">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Готові захистити себе від блекаутів?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Оберіть найкращий павербанк або кабель для ваших потреб
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="#products">
                  Переглянути товари <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-white text-white hover:bg-white hover:text-blue-600"
                asChild
              >
                <Link href="/contacts">Зв'язатися з нами</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
});

export default HomePageClient;
