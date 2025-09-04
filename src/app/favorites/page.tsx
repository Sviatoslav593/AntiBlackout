"use client";

import { useFavorites } from "@/context/FavoritesContext";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import ProductCard from "@/components/ProductCard";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function FavoritesPage() {
  const { items: favoriteItems, count, clearFavorites } = useFavorites();
  const { state: cartState } = useCart();
  const { showToast } = useToast();

  const handleClearFavorites = () => {
    clearFavorites();
    showToast({
      title: "Обрані товари очищені",
      description: "Всі товари видалені з обраних",
    });
  };

  if (count === 0) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 pb-12 pt-6 sm:pt-8">
          <div className="container mx-auto px-2 sm:px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-xs sm:max-w-md mx-auto"
            >
              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-8 mb-6">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                    ease: "easeInOut",
                  }}
                  className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-red-50 rounded-full flex items-center justify-center"
                >
                  <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-red-400" />
                </motion.div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
                  Обрані товари
                </h1>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                  Ви ще не додали жодного товару до обраних. Знайдіть товари,
                  які вам подобаються, і додайте їх сюди.
                </p>
                <Link href="/">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-colors cursor-pointer text-sm sm:text-base">
                    <ShoppingBag className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    Переглянути товари
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 pb-12">
        <div className="container mx-auto px-2 sm:px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 sm:mb-8"
          >
            <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                  Обрані товари
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                  У вас {count}{" "}
                  {count === 1 ? "обраний товар" : "обрані товари"}
                </p>
              </div>
              <div className="flex flex-col xs:flex-row gap-2 sm:gap-3">
                <Link href="/">
                  <Button
                    variant="outline"
                    className="cursor-pointer border-gray-300 hover:border-gray-400 w-full xs:w-auto text-xs sm:text-sm"
                  >
                    <ShoppingBag className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    Продовжити покупки
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={handleClearFavorites}
                  className="cursor-pointer border-red-300 text-red-600 hover:border-red-400 hover:text-red-700 hover:bg-red-50 w-full xs:w-auto text-xs sm:text-sm"
                >
                  <Heart className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Очистити всі
                </Button>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {favoriteItems.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ProductCard
                  product={product}
                  cartQuantity={
                    cartState.items.find((item) => item.id === product.id)
                      ?.quantity || 0
                  }
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Summary Section */}
          {count > 3 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8 sm:mt-12 bg-white rounded-lg shadow-sm p-4 sm:p-6 text-center"
            >
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                Великий вибір обраних товарів!
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
                У вас є {count} обраних товарів. Не забудьте додати їх до
                кошика.
              </p>
              <div className="flex justify-center gap-3">
                <Link href="/cart">
                  <Button className="bg-green-600 hover:bg-green-700 text-white cursor-pointer text-xs sm:text-sm px-3 sm:px-4 py-2">
                    Переглянути кошик ({cartState.itemCount})
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
}
