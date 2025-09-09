"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Layout from "@/components/Layout";
import ProductCard, { Product } from "@/components/ProductCard";
import { Battery, Zap, Shield, Truck, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { SITE_CONFIG } from "@/lib/seo";
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
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [popularPowerBanks, setPopularPowerBanks] = useState<Product[]>([]);
  const [popularCables, setPopularCables] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);

        // Fetch categories
        const categoriesResponse = await fetch("/api/categories");
        const categoriesData = await categoriesResponse.json();

        if (categoriesData.success) {
          setCategories(categoriesData.categories);
        }

        // Fetch popular power banks (category 3 and its children)
        const powerBanksResponse = await fetch("/api/products?categoryId=3&limit=50");
        const powerBanksData = await powerBanksResponse.json();

        if (powerBanksData.success) {
          setPopularPowerBanks(powerBanksData.products.slice(0, 50));
        }

        // Fetch popular cables (category 16)
        const cablesResponse = await fetch("/api/products?categoryId=16&limit=50");
        const cablesData = await cablesResponse.json();

        if (cablesData.success) {
          setPopularCables(cablesData.products.slice(0, 50));
        }
      } catch (error) {
        console.error("Error fetching home data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const scrollToProducts = () => {
    document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
  };

  const getCategorySlug = (categoryName: string) => {
    return categoryName.toLowerCase().replace(/\s+/g, '-');
  };

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
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up-delay-2">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                onClick={scrollToProducts}
              >
                Переглянути Товари
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold rounded-xl backdrop-blur-sm transition-all duration-300 hover:scale-105"
                onClick={scrollToProducts}
              >
                Дізнатися Більше
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
      <section id="products" className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Категорії Товарів
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Оберіть категорію, яка вас цікавить
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {categories.map((category) => (
              <Card
                key={category.id}
                className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105"
                onClick={() =>
                  router.push(`/category/${getCategorySlug(category.name)}`)
                }
              >
                <CardHeader className="text-center">
                  <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                    {category.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground mb-4">
                    {category.children?.length || 0} підкатегорій
                  </p>
                  <Button
                    variant="outline"
                    className="group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all duration-300"
                  >
                    Переглянути
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Power Banks Section */}
      {popularPowerBanks.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-2">
                  Популярні Павербанки
                </h2>
                <p className="text-xl text-muted-foreground">
                  Найкращі портативні батареї для вашого пристрою
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => router.push("/category/portativni-batarei")}
                className="hidden sm:flex"
              >
                Переглянути всі
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {popularPowerBanks.slice(0, 10).map((product, index) => (
                <div
                  key={product.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>

            <div className="text-center mt-8 sm:hidden">
              <Button
                variant="outline"
                onClick={() => router.push("/category/portativni-batarei")}
              >
                Переглянути всі павербанки
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Popular Cables Section */}
      {popularCables.length > 0 && (
        <section className="py-16">
          <div className="container">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-2">
                  Популярні Кабелі
                </h2>
                <p className="text-xl text-muted-foreground">
                  Якісні кабелі для швидкої зарядки та передачі даних
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => router.push("/category/kabeli-usb")}
                className="hidden sm:flex"
              >
                Переглянути всі
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {popularCables.slice(0, 10).map((product, index) => (
                <div
                  key={product.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>

            <div className="text-center mt-8 sm:hidden">
              <Button
                variant="outline"
                onClick={() => router.push("/category/kabeli-usb")}
              >
                Переглянути всі кабелі
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
      )}

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
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
              onClick={scrollToProducts}
            >
              Переглянути Каталог
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold"
              onClick={scrollToProducts}
            >
              Дізнатися Більше
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
