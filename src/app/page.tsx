"use client";

import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import ProductCard, { Product } from "@/components/ProductCard";
import Filters, { FilterState } from "@/components/Filters";
import SortDropdown, {
  SortOption,
  sortProducts,
} from "@/components/SortDropdown";
import {
  Battery,
  Zap,
  Shield,
  Truck,
  Smartphone,
  Wifi,
  Plug,
  Cable,
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useSearch } from "@/context/SearchContext";
import { useFilters } from "@/context/FilterContext";
import { SITE_CONFIG } from "@/lib/seo";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

const features = [
  {
    icon: Battery,
    title: "Довготривала Робота",
    description: "Потужні батареї, які забезпечують роботу протягом днів",
  },
  {
    icon: Zap,
    title: "Швидка Зарядка",
    description: "Технологія швидкої зарядки повертає 100% заряду миттєво",
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
    description: "Відправлення в день замовлення по всій Україні",
  },
];

interface Category {
  id: number;
  name: string;
  parent_id?: number;
  children?: Category[];
}

export default function Home() {
  // State for products
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const router = useRouter();

  // Search context
  const { searchQuery, clearSearch } = useSearch();

  // Scroll restoration
  useEffect(() => {
    const savedScrollPosition = sessionStorage.getItem("scrollPosition");
    if (savedScrollPosition) {
      window.scrollTo(0, parseInt(savedScrollPosition));
      sessionStorage.removeItem("scrollPosition");
    }
  }, []);

  // Save scroll position when navigating away
  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.setItem("scrollPosition", window.scrollY.toString());
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // Fetch products and categories from database
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch products
        const productsResponse = await fetch("/api/products?limit=500");
        const productsData = await productsResponse.json();

        if (!productsData.success) {
          console.error("Error fetching products:", productsData.error);
          return;
        }

        console.log("Fetched products from API:", productsData.products.length);
        setAllProducts(productsData.products);

        // Fetch categories
        const categoriesResponse = await fetch("/api/categories");
        const categoriesData = await categoriesResponse.json();

        if (categoriesData.success) {
          setCategories(categoriesData.categories);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter and sort state
  const [sortBy, setSortBy] = useState<SortOption>("popularity-desc");
  const { filters, setFilters } = useFilters();

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
          product.categories?.name?.toLowerCase().includes(searchLower);
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

      // Capacity filter (for power banks)
      if (product.capacity) {
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
    if (name.includes("акумулятор") || name.includes("powerbank"))
      return Battery;
    if (name.includes("зарядк") || name.includes("кабел")) return Cable;
    if (name.includes("портативн") || name.includes("батаре"))
      return Smartphone;
    if (name.includes("бездротов")) return Wifi;
    if (name.includes("мережев")) return Plug;
    return Zap;
  };

  return (
    <Layout>
      {/* Structured Data for Homepage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: SITE_CONFIG.name,
            description: SITE_CONFIG.description,
            url: SITE_CONFIG.url,
            potentialAction: {
              "@type": "SearchAction",
              target: {
                "@type": "EntryPoint",
                urlTemplate: `${SITE_CONFIG.url}/?search={search_term_string}`,
              },
              "query-input": "required name=search_term_string",
            },
          }),
        }}
      />

      {/* Hero Section */}
      <section className="relative hero-gradient text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></div>
        <div className="relative container py-24 md:py-32">
          <div className="max-w-3xl mx-auto text-center space-y-8 animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight animate-slide-up">
              Залишайтесь на Зв'язку Під Час Будь-якого Блекауту
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 leading-relaxed animate-slide-up-delay">
              Купуйте павербанки, зарядні пристрої та кабелі, щоб залишатися на
              зв'язку навіть під час відключення електроенергії
            </p>
            <div className="flex justify-center animate-slide-up-delay-2">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                onClick={scrollToProducts}
              >
                Переглянути Товари
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Чому Обирають Нас
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Ми пропонуємо найкращі рішення для забезпечення безперебійної
              роботи ваших пристроїв
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="text-center group hover:scale-105 transition-transform duration-300"
              >
                <div className="mx-auto w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-700 group-hover:rotate-6 transition-all duration-300">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mt-4 mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Категорії Товарів
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Оберіть категорію, яка вас цікавить
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-16">
            {(() => {
              // Flatten all categories including subcategories
              const allCategories: Category[] = [];
              categories.forEach((category) => {
                // Add main category
                allCategories.push(category);
                // Add all subcategories as separate items
                if (category.children && category.children.length > 0) {
                  allCategories.push(...category.children);
                }
              });

              return allCategories.slice(0, 9).map((category) => {
                const IconComponent = getCategoryIcon(category.name);
                return (
                  <div
                    key={category.id}
                    className="group cursor-pointer bg-white rounded-xl p-3 sm:p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105 border border-gray-200"
                    onClick={() => {
                      // Check if we're on the client side
                      if (typeof window === "undefined") return;

                      // Set category filter and scroll to products
                      setFilters((prev) => ({
                        ...prev,
                        categories: [category.name],
                      }));
                      // Scroll to products section
                      setTimeout(() => {
                        const el = document.getElementById("products");
                        if (el) {
                          el.scrollIntoView({ behavior: "smooth" });
                        }
                      }, 100);
                    }}
                  >
                    <div className="text-center">
                      <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-600 group-hover:scale-110 transition-all duration-300 mb-2 sm:mb-4">
                        <IconComponent className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 group-hover:text-white transition-colors" />
                      </div>
                      <h3 className="text-sm sm:text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1 sm:mb-2">
                        {category.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500">
                        {category.parent_id ? "Підкатегорія" : "Категорія"}
                      </p>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Всі Товари</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Знайдіть ідеальний товар для забезпечення безперебійної роботи
              ваших пристроїв
            </p>
          </div>

          {/* Mobile Layout */}
          <div className="lg:hidden">
            {/* Mobile Filters and Sort */}
            <div className="mb-8">
              <div className="flex flex-col gap-4 items-start justify-between">
                <Filters
                  filters={filters}
                  onFiltersChange={setFilters}
                  availableCategories={availableCategories}
                  availableBrands={availableBrands}
                  priceRange={{ min: 0, max: 10000 }}
                  capacityRange={{ min: 0, max: 50000 }}
                />
                <SortDropdown value={sortBy} onValueChange={setSortBy} />
              </div>
            </div>

            {/* Mobile Products Grid */}
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-muted-foreground">
                    Завантаження товарів...
                  </p>
                </div>
              </div>
            ) : filteredAndSortedProducts.length === 0 ? (
              <div className="text-center py-16">
                <h3 className="text-xl font-semibold mb-2">
                  Товари не знайдені
                </h3>
                <p className="text-muted-foreground mb-4">
                  Спробуйте змінити фільтри або пошуковий запит
                </p>
                <Button onClick={clearSearch} variant="outline">
                  Очистити фільтри
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:gap-6">
                {filteredAndSortedProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className="animate-slide-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:flex gap-8">
            {/* Desktop Filters Sidebar */}
            <div className="w-80 flex-shrink-0">
              <Filters
                filters={filters}
                onFiltersChange={setFilters}
                availableCategories={availableCategories}
                availableBrands={[]}
                priceRange={{ min: 0, max: 10000 }}
                capacityRange={{ min: 0, max: 50000 }}
              />
            </div>

            {/* Products Content */}
            <div className="flex-1">
              {/* Sort Dropdown */}
              <div className="mb-6">
                <SortDropdown value={sortBy} onValueChange={setSortBy} />
              </div>

              {/* Products Grid */}
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-muted-foreground">
                      Завантаження товарів...
                    </p>
                  </div>
                </div>
              ) : filteredAndSortedProducts.length === 0 ? (
                <div className="text-center py-16">
                  <h3 className="text-xl font-semibold mb-2">
                    Товари не знайдені
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Спробуйте змінити фільтри або пошуковий запит
                  </p>
                  <Button onClick={clearSearch} variant="outline">
                    Очистити фільтри
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {filteredAndSortedProducts.map((product, index) => (
                    <div
                      key={product.id}
                      className="animate-slide-up"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Готові Забезпечити Безперебійну Роботу?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Оберіть найкращі рішення для зарядки та підтримки ваших пристроїв
            під час будь-яких обставин
          </p>
          <div className="flex justify-center">
            <Button
              size="lg"
              variant="secondary"
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
              onClick={scrollToProducts}
            >
              Переглянути Каталог
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
