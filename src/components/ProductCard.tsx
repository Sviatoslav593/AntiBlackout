"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Star, ShoppingCart, Plus, Minus } from "lucide-react";
import { useCart } from "@/context/CartContext";

export interface Product {
  id: number;
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
  const quantity = getItemQuantity(product.id);

  const handleAddToCart = () => {
    addItem(product);
  };

  const handleIncrement = () => {
    updateQuantity(product.id, quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      updateQuantity(product.id, quantity - 1);
    }
  };

  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1">
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
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-lg leading-tight line-clamp-2">
            {product.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {product.description}
          </p>

          {/* Rating */}
          <div className="flex items-center space-x-1">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(product.rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              ({product.reviewCount})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center space-x-2">
            <span className="text-lg sm:text-2xl font-bold text-foreground">
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

      <CardFooter className="p-3 pt-0">
        {quantity > 0 ? (
          <div className="w-full flex items-center justify-between gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDecrement}
              className="cursor-pointer"
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="font-medium text-sm">В кошику: {quantity}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleIncrement}
              className="cursor-pointer"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <Button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className="w-full hover:scale-105 transition-transform duration-200 cursor-pointer disabled:cursor-not-allowed text-xs sm:text-sm px-2 py-3"
            size="sm"
          >
            {product.inStock ? (
              <>
                <ShoppingCart className="mr-1 h-3 w-3 sm:h-4 sm:w-4 group-hover:animate-bounce" />
                Додати в кошик
              </>
            ) : (
              "Немає в наявності"
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
