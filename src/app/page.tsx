"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import Layout from "@/components/Layout";
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
  // State for products
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>("popularity-desc");

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

  // Fetch products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/products");
        const data = await response.json();

        if (data.success && data.products) {
          setAllProducts(data.products);
        } else {
          console.error("Failed to fetch products:", data.error);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

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

  // Available categories for filtering
  const availableCategories = useMemo(() => {
    const categorySet = new Set<string>();
    allProducts.forEach((product) => {
      if (product.categories?.name) {
        categorySet.add(product.categories.name);
      }
    });
    return Array.from(categorySet).sort();
  }, [allProducts]);

  // Available brands for filtering
  const availableBrands = useMemo(() => {
    const brandSet = new Set<string>();
    allProducts.forEach((product) => {
      if (product.brand) {
        brandSet.add(product.brand);
      }
    });
    return Array.from(brandSet).sort();
  }, [allProducts]);

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = allProducts.filter((product) => {
      // Search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch =
          product.name.toLowerCase().includes(searchLower) ||
          product.description?.toLowerCase().includes(searchLower) ||
          product.categories?.name?.toLowerCase().includes(searchLower) ||
          product.brand?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Price filter
      if (
        product.price < filters.priceRange.min ||
        product.price > filters.priceRange.max
      ) {
        return false;
      }

      // Stock filter
      if (filters.inStockOnly && !product.inStock) {
        return false;
      }

      // Category filter
      if (filters.categories.length > 0) {
        const productCategory = product.categories?.name;
        if (!productCategory || !filters.categories.includes(productCategory)) {
          return false;
        }
      }

      // Brand filter
      if (filters.brands.length > 0) {
        if (!product.brand || !filters.brands.includes(product.brand)) {
          return false;
        }
      }

      // Capacity filter (for power banks)
      if (product.capacity && product.capacity > 0) {
        if (
          product.capacity < filters.capacityRange.min ||
          product.capacity > filters.capacityRange.max
        ) {
          return false;
        }
      }

      return true;
    });

    return sortProducts(filtered, sortBy);
  }, [allProducts, searchQuery, filters, sortBy]);

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
  const handleCategoryClick = (categoryName: string) => {
    // Set category filter
    setFilters((prev) => ({
      ...prev,
      categories: [categoryName],
    }));

    // Scroll to products section
    scrollToProducts();
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Hero Section */}
        <section className="relative py-16 lg:py-24 overflow-hidden">
          <div className="container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-8"
              >
                <div className="space-y-4">
                  <Badge className="inline-block bg-blue-100 text-blue-800">
                    🔋 Новинка
                  </Badge>
                  <h1 className="text-4xl lg:text-6xl font-bold tracking-tight text-gray-900">
                    Завжди на зв'язку
                    <span className="block text-blue-600">з AntiBlackout</span>
                  </h1>
                  <p className="text-xl text-gray-600 leading-relaxed">
                    Професійні рішення для зарядки та живлення ваших пристроїв.
                    Найширший асортимент павербанків, зарядних пристроїв та
                    аксесуарів в Україні.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    size="lg"
                    onClick={scrollToProducts}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-semibold cursor-pointer"
                  >
                    <ShoppingBag className="w-5 h-5 mr-2" />
                    Переглянути каталог
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    asChild
                    className="border-blue-200 text-blue-600 hover:bg-blue-50 px-8 py-3 text-lg font-semibold cursor-pointer"
                  >
                    <Link href="/about">
                      Дізнатися більше
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  </Button>
                </div>

                {/* Features */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8">
                  <div className="flex items-center gap-3">
                    <Shield className="w-8 h-8 text-green-600" />
                    <div>
                      <p className="font-semibold text-gray-900">
                        Гарантія якості
                      </p>
                      <p className="text-sm text-gray-600">Офіційна гарантія</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Truck className="w-8 h-8 text-blue-600" />
                    <div>
                      <p className="font-semibold text-gray-900">
                        Швидка доставка
                      </p>
                      <p className="text-sm text-gray-600">По всій Україні</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Headphones className="w-8 h-8 text-purple-600" />
                    <div>
                      <p className="font-semibold text-gray-900">
                        Підтримка 24/7
                      </p>
                      <p className="text-sm text-gray-600">Завжди на зв'язку</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative"
              >
                <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 p-8">
                  <Image
                    src="/hero-image.jpg"
                    alt="Power Banks and Chargers"
                    width={600}
                    height={400}
                    className="w-full h-auto rounded-lg"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg" />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16 bg-white">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Категорії товарів
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Оберіть категорію, яка вас цікавить
              </p>
            </motion.div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {availableCategories.map((category, index) => {
                const Icon = getCategoryIcon(category);
                return (
                  <motion.button
                    key={category}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    onClick={() => handleCategoryClick(category)}
                    className="group relative bg-white border-2 border-gray-100 rounded-2xl p-6 hover:border-blue-200 hover:shadow-lg transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-300 text-sm lg:text-base">
                          {category}
                        </h3>
                        <p className="text-xs lg:text-sm text-gray-500 mt-1">
                          {
                            allProducts.filter(
                              (p) => p.categories?.name === category
                            ).length
                          }{" "}
                          товарів
                        </p>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section id="products" className="py-16 bg-gray-50">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 space-y-4 lg:space-y-0"
            >
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
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="popularity-desc">За популярністю</option>
                  <option value="price-asc">Ціна: низька → висока</option>
                  <option value="price-desc">Ціна: висока → низька</option>
                  <option value="name-asc">За назвою А-Я</option>
                  <option value="newest-first">Спочатку нові</option>
                </select>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
              {/* Filters Sidebar */}
              <div className="xl:col-span-1">
                <Filters
                  filters={filters}
                  onFiltersChange={() => {}} // Handled by FilterContext
                  availableCategories={availableCategories}
                  availableBrands={availableBrands}
                  priceRange={priceRange}
                  capacityRange={capacityRange}
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
                      >
                        <div className="aspect-square bg-gray-200 rounded-lg mb-4" />
                        <div className="h-4 bg-gray-200 rounded mb-2" />
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                      </div>
                    ))}
                  </div>
                ) : filteredAndSortedProducts.length > 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6 }}
                    className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6"
                  >
                    {filteredAndSortedProducts.map((product, index) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                      >
                        <ProductCard
                          product={{
                            ...product,
                            category:
                              product.categories?.name || "Uncategorized",
                          }}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center py-16"
                  >
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
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center text-white"
            >
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
            </motion.div>
          </div>
        </section>

        {/* Scroll to Products Button */}
        <ScrollToProductsButton />
      </div>
    </Layout>
  );
}
