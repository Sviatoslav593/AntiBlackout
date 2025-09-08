"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Star, ShoppingCart, Plus, Minus, Heart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { useFavorites } from "@/context/FavoritesContext";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export interface Product {
  id: string; // UUID string
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  badge?: string;
  capacity: number;
  brand: string;
  popularity: number;
  createdAt: string;
  category: string;
}

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem, getItemQuantity, updateQuantity } = useCart();
  const { showToast } = useToast();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const router = useRouter();
  const quantity = getItemQuantity(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    addItem(product);

    showToast({
      title: `${product.name} додано до кошика!`,
      description: `Кількість: 1 шт. • ${product.price} ₴`,
      action: {
        label: "Переглянути Кошик",
        onClick: () => router.push("/cart"),
      },
      duration: 4000,
    });
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    updateQuantity(product.id, quantity + 1);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    if (quantity > 1) {
      updateQuantity(product.id, quantity - 1);
    }
  };

  const handleDetailsClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click (though it does the same thing)
    router.push(`/product/${product.id}`);
  };

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click

    const isCurrentlyFavorite = isFavorite(product.id.toString());

    if (isCurrentlyFavorite) {
      removeFromFavorites(product.id.toString());
      showToast({
        title: "Видалено з обраних",
        description: `${product.name} видалено з обраних товарів`,
      });
    } else {
      addToFavorites({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        description: product.description,
        rating: product.rating,
        reviewCount: product.reviewCount,
        inStock: product.inStock,
        badge: product.badge,
        capacity: product.capacity,
        brand: product.brand,
        popularity: product.popularity,
        createdAt: product.createdAt,
        category: product.category,
      });
      showToast({
        title: "Додано до обраних!",
        description: `${product.name} додано до обраних товарів`,
        action: {
          label: "Переглянути обрані",
          onClick: () => router.push("/favorites"),
        },
      });
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on buttons
    const target = e.target as HTMLElement;
    const isButton = target.closest("button") || target.tagName === "BUTTON";

    if (!isButton) {
      router.push(`/product/${product.id}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -4 }}
    >
      <Card
        className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 cursor-pointer"
        onClick={handleCardClick}
      >
        {/* Badge */}
        {product.badge && (
          <div className="absolute top-3 left-3 z-10 rounded-full bg-blue-600 px-2 py-1 text-xs font-medium text-white animate-pulse">
            {product.badge}
          </div>
        )}

        <CardHeader className="p-0">
          <div className="relative aspect-square overflow-hidden rounded-t-lg">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />

            {/* Favorite Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFavoriteToggle}
              className={`absolute top-2 right-2 h-8 w-8 p-0 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white/95 transition-all cursor-pointer ${
                isFavorite(product.id.toString())
                  ? "text-red-500 hover:text-red-600"
                  : "text-gray-600 hover:text-gray-700"
              }`}
            >
              <motion.div whileTap={{ scale: 0.8 }} whileHover={{ scale: 1.1 }}>
                <Heart
                  className={`h-4 w-4 transition-colors ${
                    isFavorite(product.id.toString())
                      ? "fill-red-500 text-red-500"
                      : "text-gray-600"
                  }`}
                />
              </motion.div>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-2 sm:p-4">
          <div className="space-y-1 sm:space-y-2">
            <h3 className="font-semibold text-sm sm:text-lg leading-tight line-clamp-2">
              {product.name}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
              {product.description}
            </p>

            {/* Rating */}
            <div className="flex items-center space-x-1">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 sm:h-4 sm:w-4 ${
                      i < Math.floor(product.rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs sm:text-sm text-muted-foreground">
                ({product.reviewCount})
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-1 sm:space-x-2">
              <span className="text-base sm:text-lg lg:text-2xl font-bold text-foreground">
                {product.price} ₴
              </span>
              {product.originalPrice && (
                <span className="text-xs sm:text-sm text-muted-foreground line-through">
                  {product.originalPrice} ₴
                </span>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-2 sm:p-3 pt-0">
          <div className="w-full space-y-1 sm:space-y-2">
            {/* Add to Cart / Quantity Controls */}
            {quantity > 0 ? (
              <div className="w-full flex items-center justify-between gap-1 sm:gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDecrement}
                  className="cursor-pointer h-8 w-8 p-0 sm:h-auto sm:w-auto sm:px-3"
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="font-medium text-xs sm:text-sm">
                  В кошику: {quantity}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleIncrement}
                  className="cursor-pointer h-8 w-8 p-0 sm:h-auto sm:w-auto sm:px-3"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <motion.div
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.02 }}
              >
                <Button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className="w-full transition-all duration-200 cursor-pointer disabled:cursor-not-allowed text-xs sm:text-sm px-2 py-2 sm:py-3 min-h-[36px] sm:min-h-[48px]"
                  size="sm"
                >
                  {product.inStock ? (
                    <>
                      <motion.div
                        animate={{ rotate: [0, 15, -15, 0] }}
                        transition={{ duration: 0.5, repeat: 0 }}
                      >
                        <ShoppingCart className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                      </motion.div>
                      <span className="hidden xs:inline">Додати в кошик</span>
                      <span className="xs:hidden">Додати</span>
                    </>
                  ) : (
                    <span className="text-xs">Немає в наявності</span>
                  )}
                </Button>
              </motion.div>
            )}

            {/* Details Button - Always below cart button */}
            <Button
              variant="outline"
              onClick={handleDetailsClick}
              className="w-full text-xs sm:text-sm cursor-pointer h-8 sm:h-auto py-1 sm:py-2"
              size="sm"
            >
              Детальніше
            </Button>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
