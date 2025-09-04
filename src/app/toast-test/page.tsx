"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/context/ToastContext";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";

export default function ToastTestPage() {
  const { showToast } = useToast();
  const { addItem, state, isCartAnimating } = useCart();
  const router = useRouter();
  const [testCount, setTestCount] = useState(1);

  const testProduct = {
    id: 999,
    name: "Тестовий Павербанк",
    description: "Для тестування toast системи",
    price: 1500,
    image:
      "https://images.unsplash.com/photo-1609592234174-0a8f6b6f6a0e?w=400&h=400&fit=crop",
    rating: 5,
    reviewCount: 100,
    inStock: true,
    capacity: 20000,
    brand: "TestBrand",
    popularity: 10,
    createdAt: "2025-01-01",
    category: "powerbank",
  };

  const handleTestToast = () => {
    showToast({
      title: `Тест Toast #${testCount}`,
      description: `Це тестове повідомлення для перевірки функціональності`,
      action: {
        label: "Переглянути Кошик",
        onClick: () => router.push("/cart"),
      },
      duration: 5000,
    });
    setTestCount((prev) => prev + 1);
  };

  const handleTestAddToCart = () => {
    addItem(testProduct);
  };

  return (
    <div className="min-h-screen p-8 space-y-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Toast System Test</h1>

        <div className="space-y-4">
          <div className="p-4 border rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Cart State</h2>
            <div className="space-y-2">
              <p>Items in cart: {state.itemCount}</p>
              <p>Total: {state.total} ₴</p>
              <p>Cart animating: {isCartAnimating ? "Yes" : "No"}</p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Test Buttons</h2>

            <Button onClick={handleTestToast} className="w-full min-h-[48px]">
              Show Test Toast #{testCount}
            </Button>

            <Button
              onClick={handleTestAddToCart}
              className="w-full min-h-[48px]"
              variant="outline"
            >
              Add Test Product to Cart (with Toast)
            </Button>

            <Button
              onClick={() => router.push("/")}
              className="w-full min-h-[48px]"
              variant="secondary"
            >
              Back to Homepage
            </Button>
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          <h3 className="font-semibold mb-2">Instructions:</h3>
          <ol className="list-decimal list-inside space-y-1">
            <li>Click "Show Test Toast" to test basic toast functionality</li>
            <li>Click "Add Test Product" to test cart integration + toast</li>
            <li>Watch for cart icon animation in header</li>
            <li>Check if toast appears and auto-dismisses</li>
            <li>Try clicking "Go to Cart" button in toast</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
