"use client";

import { useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import SortDropdown from "@/components/SortDropdown";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ScrollToProductsButton from "@/components/ScrollToProductsButton";
import { useUrlFilters } from "@/hooks/useUrlFilters";
import { useProducts } from "@/hooks/useProducts";
import { useScrollPosition } from "@/hooks/useScrollPosition";
import { useProductStore } from "@/store/productStore";
import FiltersSPA from "@/components/FiltersSPA";
import {
  Battery,
  Shield,
  Zap,
  ArrowRight,
  ShoppingBag,
  Headphones,
  Smartphone,
} from "lucide-react";

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

export default function HomePageClient() {
  const { activeFilters, applyFiltersAndUpdateUrl, clearFilters } =
    useUrlFilters();
  const {
    filteredProducts,
    categories,
    brands,
    isLoading,
    isLoadingMore,
    hasMoreProducts,
    handleLoadMore,
  } = useProducts();
  const { restoreScrollPosition } = useScrollPosition();
  const { sortBy, setSortBy } = useProductStore();

  // Restore scroll position on mount
  useEffect(() => {
    restoreScrollPosition();
  }, [restoreScrollPosition]);

  // Sort products
  const sortedProducts = useMemo(() => {
    const products = [...filteredProducts];

    switch (sortBy) {
      case "price-asc":
        return products.sort((a, b) => a.price - b.price);
      case "price-desc":
        return products.sort((a, b) => b.price - a.price);
      case "name-asc":
        return products.sort((a, b) => a.name.localeCompare(b.name));
      case "name-desc":
        return products.sort((a, b) => b.name.localeCompare(a.name));
      case "rating-desc":
        return products.sort((a, b) => b.rating - a.rating);
      case "popularity-desc":
      default:
        return products.sort(
          (a, b) => (b.popularity || 0) - (a.popularity || 0)
        );
    }
  }, [filteredProducts, sortBy]);

  // Handle sort change
  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

        <div className="container relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Ніколи не залишайтеся без{" "}
              <span className="text-blue-600">енергії</span>
            </h1>
            <p className="text-xl lg:text-2xl text-gray-600 mb-8 leading-relaxed">
              Потужні павербанки та якісні кабелі для захисту від блекаутів.
              Швидка доставка по всій Україні.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <ScrollToProductsButton />
              <Button variant="outline" size="lg" asChild>
                <Link href="#features">
                  Дізнатися більше <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Floating elements */}
        <div className="absolute top-20 left-10 animate-bounce">
          <Battery className="h-8 w-8 text-blue-500" />
        </div>
        <div className="absolute top-40 right-20 animate-bounce delay-1000">
          <Zap className="h-6 w-6 text-yellow-500" />
        </div>
        <div className="absolute bottom-20 left-20 animate-bounce delay-2000">
          <Shield className="h-7 w-7 text-green-500" />
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
                {isLoading
                  ? "Завантаження..."
                  : `Знайдено ${sortedProducts.length} товарів`}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <SortDropdown value={sortBy} onValueChange={handleSortChange} />
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <div className="lg:w-1/4">
              <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">Фільтри</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="text-sm"
                  >
                    Очистити
                  </Button>
                </div>
                <FiltersSPA
                  availableCategories={categories}
                  availableBrands={brands}
                  priceRange={{ min: 0, max: 10000 }}
                  capacityRange={{ min: 0, max: 50000 }}
                />
              </div>
            </div>

            {/* Products Grid */}
            <div className="lg:w-3/4">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>

                  {/* Load More Button */}
                  {hasMoreProducts && (
                    <div className="text-center mt-12">
                      <Button
                        onClick={handleLoadMore}
                        disabled={isLoadingMore}
                        size="lg"
                        className="px-8"
                      >
                        {isLoadingMore ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Завантаження...
                          </>
                        ) : (
                          "Завантажити ще"
                        )}
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
                  <Button onClick={clearFilters} variant="outline">
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
                <Link href="/contact">Зв'язатися з нами</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
