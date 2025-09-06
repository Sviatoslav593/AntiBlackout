"use client";

import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import ProductCard, { Product } from "@/components/ProductCard";
import Filters, { FilterState } from "@/components/Filters";
import SortDropdown, {
  SortOption,
  sortProducts,
} from "@/components/SortDropdown";
import { Battery, Zap, Shield, Truck } from "lucide-react";
import { useState, useMemo } from "react";
import { useSearch } from "@/context/SearchContext";
import productsData from "@/data/products.json";
import { SITE_CONFIG } from "@/lib/seo";

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

export default function Home() {
  // Cast the imported JSON data to Product[] with proper type handling
  const allProducts = productsData.map((product) => ({
    ...product,
    originalPrice: product.originalPrice || undefined,
    badge: product.badge || undefined,
  })) as Product[];

  // Search context
  const { searchQuery, clearSearch } = useSearch();

  // Filter and sort state
  const [sortBy, setSortBy] = useState<SortOption>("popularity-desc");
  const [filters, setFilters] = useState<FilterState>({
    priceRange: { min: 0, max: 10000 },
    categories: [],
    brands: [],
    capacityRange: { min: 0, max: 50000 },
    inStockOnly: false,
  });

  // Calculate available options for filters
  const availableCategories = useMemo(() => {
    return Array.from(new Set(allProducts.map((p) => p.category)));
  }, [allProducts]);

  const availableBrands = useMemo(() => {
    return Array.from(new Set(allProducts.map((p) => p.brand)));
  }, [allProducts]);

  const priceRange = useMemo(() => {
    const prices = allProducts.map((p) => p.price);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [allProducts]);

  const capacityRange = useMemo(() => {
    const capacities = allProducts.map((p) => p.capacity).filter((c) => c > 0);
    return {
      min: capacities.length > 0 ? Math.min(...capacities) : 0,
      max: capacities.length > 0 ? Math.max(...capacities) : 50000,
    };
  }, [allProducts]);

  // Filter products based on current filters and search query
  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      // Search filter - case insensitive partial matching
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesDescription =
          product.description?.toLowerCase().includes(query) || false;
        const matchesBrand = product.brand.toLowerCase().includes(query);
        const matchesCategory = product.category.toLowerCase().includes(query);

        if (
          !matchesName &&
          !matchesDescription &&
          !matchesBrand &&
          !matchesCategory
        ) {
          return false;
        }
      }

      // Price filter
      if (
        product.price < filters.priceRange.min ||
        product.price > filters.priceRange.max
      ) {
        return false;
      }

      // Category filter
      if (
        filters.categories.length > 0 &&
        !filters.categories.includes(product.category)
      ) {
        return false;
      }

      // Brand filter
      if (
        filters.brands.length > 0 &&
        !filters.brands.includes(product.brand)
      ) {
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
  }, [allProducts, filters, searchQuery]);

  // Sort filtered products
  const sortedProducts = useMemo(() => {
    return sortProducts(filteredProducts, sortBy);
  }, [filteredProducts, sortBy]);

  const scrollToProducts = () => {
    document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
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
              зв'язку, коли це найбільш важливо. Ніколи не дозволяйте
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

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
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
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-16">
        <div className="container">
          <div className="text-center space-y-4 mb-12 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold">Каталог Товарів</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Відкрийте для себе наш асортимент надійних енергетичних рішень,
              розроблених для підтримки зв'язку під час надзвичайних ситуацій та
              повсякденного використання.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <Filters
                filters={filters}
                onFiltersChange={setFilters}
                availableCategories={availableCategories}
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
                  {searchQuery && (
                    <p className="text-sm text-blue-600 font-medium">
                      Результати пошуку для: "{searchQuery}"
                    </p>
                  )}
                  <p className="text-muted-foreground">
                    Знайдено {sortedProducts.length} з {allProducts.length}{" "}
                    товарів
                  </p>
                </div>
                <SortDropdown value={sortBy} onValueChange={setSortBy} />
              </div>

              {/* Products Grid */}
              {sortedProducts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {sortedProducts.map((product: Product, index) => (
                    <div
                      key={product.id}
                      className="animate-slide-up"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 space-y-4">
                  <div className="text-6xl">🔍</div>
                  <h3 className="text-xl font-semibold">
                    {searchQuery ? "Нічого не знайдено" : "Товари не знайдено"}
                  </h3>
                  <p className="text-muted-foreground">
                    {searchQuery
                      ? `За запитом "${searchQuery}" нічого не знайдено. Спробуйте інший пошуковий запит або змініть фільтри.`
                      : "Спробуйте змінити параметри фільтрації або очистити фільтри"}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    {searchQuery && (
                      <Button
                        variant="default"
                        onClick={clearSearch}
                        className="cursor-pointer"
                      >
                        Очистити пошук
                      </Button>
                    )}
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
                      className="cursor-pointer"
                    >
                      Очистити фільтри
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-8 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold animate-slide-up">
              Готові Залишатись на Зв'язку?
            </h2>
            <p className="text-xl text-muted-foreground animate-slide-up-delay">
              Приєднуйтесь до тисяч клієнтів, які довіряють AntiBlackout у своїх
              потребах аварійного живлення. Швидка доставка з відправленням в
              день замовлення по всій Україні.
            </p>
            <Button
              size="lg"
              onClick={scrollToProducts}
              className="text-lg px-8 py-6 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl animate-slide-up-delay-2 cursor-pointer"
            >
              Переглянути Всі Товари
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
export const dynamic = "force-dynamic";
