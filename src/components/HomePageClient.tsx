"use client";

import { useEffect, useMemo, useState, useCallback, useRef, memo } from "react";
import Image from "next/image";
import Link from "next/link";
import SortDropdown from "@/components/SortDropdown";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ScrollToProductsButton from "@/components/ScrollToProductsButton";
import { useScrollPosition } from "@/hooks/useScrollPosition";
import FiltersSPA from "@/components/FiltersSPA";
import { UrlFiltersProvider } from "@/components/UrlFiltersProvider";
import { useUrlFilters } from "@/hooks/useUrlFilters";
import { useProductStore, FilterParams } from "@/store/productStore";
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

const HomePageClientContent = memo(function HomePageClientContent() {
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
  const [isMounted, setIsMounted] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(25);
  const [currentMobileFilters, setCurrentMobileFilters] =
    useState<FilterParams | null>(null);
  const prevFilterState = useRef<string>("");

  // Block background scrolling when mobile filters are open
  useEffect(() => {
    if (isMobileFiltersOpen) {
      // Block scrolling on mobile devices
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
      document.body.style.height = "100%";
    } else {
      // Restore scrolling
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.height = "";
    }
  }, [isMobileFiltersOpen]);

  // Context hooks
  const { restoreScrollPosition } = useScrollPosition();
  const { activeFilters, applyFiltersAndUpdateUrl, clearFilters } =
    useUrlFilters();
  const { filteredProducts } = useProductStore();

  // Load products, categories, and brands on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Load products from all categories
        const productsResponse = await fetch("/api/products?limit=10000");
        const productsData = await productsResponse.json();

        if (productsData.success && productsData.products) {
          console.log("Loaded products:", productsData.products.slice(0, 2));
          console.log("First product structure:", productsData.products[0]);
          setAllProducts(productsData.products);
          useProductStore.getState().setProducts(productsData.products);
          
          // Apply current filters after loading products
          console.log("Applying filters after loading products:", activeFilters);
          // Use setTimeout to ensure products are set in store before applying filters
          setTimeout(() => {
            applyFiltersAndUpdateUrl(activeFilters);
          }, 100);
        }

        // Load categories
        const categoriesResponse = await fetch("/api/categories");
        const categoriesData = await categoriesResponse.json();

        if (categoriesData.success && categoriesData.flat) {
          // Use flat categories array which contains all categories
          const categoryNames = categoriesData.flat.map((cat: any) => cat.name);
          setAllCategories(categoryNames);

          // Also load categories into store for filtering
          useProductStore.getState().setCategories(categoryNames);
        }

        // Load brands
        const brandsResponse = await fetch("/api/brands");
        const brandsData = await brandsResponse.json();

        if (brandsData.success && brandsData.brands) {
          setAllBrands(brandsData.brands);

          // Also load brands into store for filtering
          useProductStore.getState().setBrands(brandsData.brands);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Restore scroll position on mount
  useEffect(() => {
    restoreScrollPosition();
  }, [restoreScrollPosition]);

  // Sort products and apply local pagination
  const sortedProducts = useMemo(() => {
    const products = [...(filteredProducts || allProducts)];

    // Debug logging
    console.log("HomePageClient sortedProducts:", {
      filteredProducts: filteredProducts?.length,
      allProducts: allProducts.length,
      usingFiltered: !!filteredProducts,
      activeFilters,
      visibleCount,
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

    // Apply local pagination - show only first visibleCount items
    return sorted.slice(0, visibleCount);
  }, [filteredProducts, allProducts, sortBy, activeFilters, visibleCount]);

  // Handle sort change
  const handleSortChange = (newSort: string) => {
    setSortBy(newSort as any);
  };

  // Handle load more products (local pagination)
  const handleLoadMore = useCallback(() => {
    setVisibleCount((prev) => prev + 25);
  }, []);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(25);
  }, [activeFilters]);

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
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

        <div className="container relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Ніколи не залишайтеся без{" "}
              <span className="text-blue-400">енергії</span>
            </h1>
            <p className="text-xl lg:text-2xl text-gray-300 mb-8 leading-relaxed">
              Потужні павербанки та якісні кабелі для захисту від блекаутів.
              Швидка доставка по всій Україні.
            </p>
            <div className="flex justify-center">
              <Button
                size="lg"
                onClick={handleScrollToProducts}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Переглянути товари <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Floating elements */}
        <div className="absolute top-20 left-10 animate-bounce">
          <Battery className="h-8 w-8 text-blue-400" />
        </div>
        <div className="absolute top-40 right-20 animate-bounce delay-1000">
          <Zap className="h-6 w-6 text-yellow-400" />
        </div>
        <div className="absolute bottom-20 left-20 animate-bounce delay-2000">
          <Shield className="h-7 w-7 text-green-400" />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
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
          <div className="text-center mb-16">
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
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
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
                Наші товари
              </h2>
              <p className="text-gray-600">
                {loading
                  ? "Завантаження..."
                  : `Знайдено ${sortedProducts.length} товарів`}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <SortDropdown value={sortBy} onValueChange={handleSortChange} />
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
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">Фільтри</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearFilters}
                    className="text-sm"
                  >
                    Очистити
                  </Button>
                </div>
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
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>

                  {/* Load More Button - Show if there are more products to display */}
                  {sortedProducts.length <
                    (filteredProducts || allProducts).length && (
                    <div className="text-center mt-12">
                      <Button
                        onClick={handleLoadMore}
                        size="lg"
                        className="px-8"
                      >
                        Завантажити ще ({sortedProducts.length} з{" "}
                        {(filteredProducts || allProducts).length})
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

// Main component with Suspense wrapper
export default function HomePageClient() {
  return (
    <UrlFiltersProvider>
      {(urlFilters) => <HomePageClientContent />}
    </UrlFiltersProvider>
  );
}
