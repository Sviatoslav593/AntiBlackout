"use client";

import React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ShoppingCart, Plus, Minus, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";

interface CartDrawerProps {
  isOpen?: boolean;
  onClose?: () => void;
  children?: React.ReactNode;
}

export function CartDrawer({ isOpen, onClose, children }: CartDrawerProps) {
  const { state, updateQuantity, removeItem } = useCart();
  const router = useRouter();

  const handleCheckout = () => {
    if (onClose) onClose();
    router.push("/checkout");
  };

  const handleViewCart = () => {
    if (onClose) onClose();
    router.push("/cart");
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      {children && <SheetTrigger asChild>{children}</SheetTrigger>}

      <SheetContent
        side="right"
        className="w-full sm:max-w-lg flex flex-col h-full p-3 sm:p-4"
      >
        <SheetHeader className="mb-3 sm:mb-4">
          <SheetTitle className="flex items-center space-x-2 text-sm sm:text-base">
            <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>Кошик ({state.itemCount})</span>
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-2">
          {state.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full space-y-3 sm:space-y-4 text-center">
              <ShoppingCart className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground/50" />
              <div>
                <h3 className="text-base sm:text-lg font-medium">
                  Кошик порожній
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Додайте товари для продовження покупок
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {state.items.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 border rounded-lg"
                >
                  <div className="relative h-12 w-12 sm:h-16 sm:w-16 flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs sm:text-sm font-medium truncate">
                      {item.name}
                    </h4>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {item.price} ₴
                    </p>
                  </div>

                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                      onClick={() =>
                        updateQuantity(item.id, Math.max(0, item.quantity - 1))
                      }
                    >
                      <Minus className="h-3 w-3" />
                    </Button>

                    <span className="w-6 sm:w-8 text-center text-xs sm:text-sm font-medium">
                      {item.quantity}
                    </span>

                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-destructive hover:text-destructive"
                    onClick={() => removeItem(item.id)}
                  >
                    <X className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {state.items.length > 0 && (
          <div className="border-t pt-3 sm:pt-4 space-y-3 sm:space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-base sm:text-lg font-semibold">
                Всього:
              </span>
              <span className="text-base sm:text-lg font-bold">
                {state.total} ₴
              </span>
            </div>

            <Separator />

            <div className="space-y-2">
              <Button
                onClick={handleCheckout}
                className="w-full min-h-[40px] sm:min-h-[48px] bg-primary hover:bg-primary/90 text-sm sm:text-base"
              >
                Оформити Замовлення
              </Button>

              <Button
                onClick={handleViewCart}
                variant="outline"
                className="w-full min-h-[40px] sm:min-h-[48px] text-sm sm:text-base"
              >
                Переглянути Кошик
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
