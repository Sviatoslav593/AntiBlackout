"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import ProductCard, { Product } from "@/components/ProductCard";
import { Battery, Zap, Shield, Truck } from "lucide-react";

// Дані товарів
const products: Product[] = [
  {
    id: 1,
    name: "PowerMax 20000мАг Швидка Зарядка",
    description:
      "Потужний павербанк з швидкою зарядкою 65Вт. Ідеально підходить для ноутбуків та кількох пристроїв.",
    price: 2999,
    originalPrice: 3699,
    image:
      "https://images.unsplash.com/photo-1609592234174-0a8f6b6f6a0e?w=400&h=400&fit=crop",
    rating: 4.8,
    reviewCount: 245,
    inStock: true,
    badge: "Хіт продажів",
  },
  {
    id: 2,
    name: "UltraSlim 10000мАг Бездротовий",
    description:
      "Компактний бездротовий павербанк з магнітним кріпленням для телефонів.",
    price: 1899,
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
    rating: 4.6,
    reviewCount: 189,
    inStock: true,
  },
  {
    id: 3,
    name: "Аварійна Сонячна Зарядка",
    description:
      "Сонячна зарядка з LED-ліхтариком. Незамінна для екстрених ситуацій на природі.",
    price: 1499,
    originalPrice: 2099,
    image:
      "https://images.unsplash.com/photo-1593642532973-d31b6557fa68?w=400&h=400&fit=crop",
    rating: 4.4,
    reviewCount: 156,
    inStock: true,
    badge: "Еко-френдлі",
  },
  {
    id: 4,
    name: "USB-C 100Вт Настінна Зарядка",
    description:
      "Швидка настінна зарядка сумісна з ноутбуками, планшетами та телефонами.",
    price: 1199,
    image:
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=400&fit=crop",
    rating: 4.7,
    reviewCount: 321,
    inStock: true,
  },
  {
    id: 5,
    name: "Багатопортова Автозарядка",
    description:
      "4-портова автозарядка зі швидкою зарядкою для всієї сім'ї в дорожніх поїздках.",
    price: 949,
    image:
      "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=400&fit=crop",
    rating: 4.5,
    reviewCount: 198,
    inStock: false,
  },
  {
    id: 6,
    name: "Преміум Набір Кабелів",
    description: "Міцні USB-C, Lightning та Micro-USB кабелі різної довжини.",
    price: 749,
    originalPrice: 1149,
    image:
      "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=400&fit=crop&auto=format",
    rating: 4.3,
    reviewCount: 412,
    inStock: true,
  },
];

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
  const handleAddToCart = (product: Product) => {
    // Це буде реалізовано з управлінням стану кошика в майбутніх блоках
    console.log("Додано до кошика:", product.name);
  };

  const scrollToProducts = () => {
    document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <Layout>
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
            <h2 className="text-3xl md:text-4xl font-bold">
              Рекомендовані Товари
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Відкрийте для себе наш асортимент надійних енергетичних рішень,
              розроблених для підтримки зв'язку під час надзвичайних ситуацій та
              повсякденного використання.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {products.map((product, index) => (
              <div
                key={product.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <ProductCard product={product} onAddToCart={handleAddToCart} />
              </div>
            ))}
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
