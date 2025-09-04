"use client";

import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function HeaderFixTestPage() {
  const { addItem, state } = useCart();
  const { showToast } = useToast();
  const router = useRouter();
  const [testCount, setTestCount] = useState(1);

  const testProduct = {
    id: 777,
    name: "Header Fix Test Product",
    description: "Testing header functionality after z-index fixes",
    price: 1500,
    image:
      "https://images.unsplash.com/photo-1609592234174-0a8f6b6f6a0e?w=400&h=400&fit=crop",
    rating: 5,
    reviewCount: 75,
    inStock: true,
    capacity: 18000,
    brand: "TestBrand",
    popularity: 8,
    createdAt: "2025-01-01",
    category: "powerbank",
  };

  const handleAddProduct = () => {
    addItem(testProduct);
  };

  const handleShowToast = () => {
    showToast({
      title: `Manual Test Toast #${testCount}`,
      description: "Testing toast positioning relative to header",
      action: {
        label: "Go to Cart",
        onClick: () => router.push("/cart"),
      },
      duration: 5000,
    });
    setTestCount((prev) => prev + 1);
  };

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Hero Section with Header Test Info */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
          <div className="container text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Header Fix Test Page
            </h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Testing header sticky behavior, button functionality, and z-index
              hierarchy
            </p>
          </div>
        </section>

        {/* Test Controls */}
        <section className="py-16">
          <div className="container max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Status Panel */}
              <div className="p-6 border rounded-lg bg-muted/50">
                <h2 className="text-2xl font-semibold mb-4">Current Status</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Cart Items:</span>
                    <strong className="text-blue-600">{state.itemCount}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Cart Total:</span>
                    <strong className="text-green-600">{state.total} ₴</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Toast Counter:</span>
                    <strong className="text-purple-600">{testCount}</strong>
                  </div>
                </div>
              </div>

              {/* Test Actions */}
              <div className="p-6 border rounded-lg">
                <h2 className="text-2xl font-semibold mb-4">Test Actions</h2>
                <div className="space-y-4">
                  <Button
                    onClick={handleAddProduct}
                    className="w-full min-h-[48px]"
                  >
                    Add Product + Show Toast
                  </Button>

                  <Button
                    onClick={handleShowToast}
                    variant="outline"
                    className="w-full min-h-[48px]"
                  >
                    Show Manual Toast #{testCount}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Test Instructions */}
        <section className="py-16 bg-muted/30">
          <div className="container max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">
              🧪 Testing Checklist
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Header Tests */}
              <div className="p-6 border rounded-lg bg-white">
                <h3 className="text-xl font-semibold mb-4 text-blue-600">
                  📱 Header Tests
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <span className="text-green-500 font-bold">✓</span>
                    <span>Header stays at top when scrolling</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-green-500 font-bold">✓</span>
                    <span>Cart button is clickable at all times</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-green-500 font-bold">✓</span>
                    <span>Mobile menu button works properly</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-green-500 font-bold">✓</span>
                    <span>Navigation links are functional</span>
                  </li>
                </ul>
              </div>

              {/* Overlay Tests */}
              <div className="p-6 border rounded-lg bg-white">
                <h3 className="text-xl font-semibold mb-4 text-purple-600">
                  🎭 Overlay Tests
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <span className="text-green-500 font-bold">✓</span>
                    <span>Toast appears below header</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-green-500 font-bold">✓</span>
                    <span>Cart drawer doesn't cover header</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-green-500 font-bold">✓</span>
                    <span>Header buttons work with drawer open</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-green-500 font-bold">✓</span>
                    <span>Multiple toasts stack properly</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Scroll Test Content */}
        <section className="py-16">
          <div className="container max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">
              📜 Scroll Test Content
            </h2>

            <div className="space-y-8">
              {Array.from({ length: 15 }, (_, i) => (
                <div
                  key={i}
                  className="p-8 border rounded-lg bg-white shadow-sm"
                >
                  <h3 className="text-2xl font-semibold mb-4 text-blue-600">
                    Test Section {i + 1}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    This is test content section {i + 1}. Keep scrolling to test
                    the sticky header behavior. The header should remain visible
                    and functional at all times. You should be able to click the
                    cart button, open the mobile menu, and interact with all
                    header elements regardless of scroll position. Lorem ipsum
                    dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
                    tempor incididunt ut labore et dolore magna aliqua. Ut enim
                    ad minim veniam, quis nostrud exercitation ullamco laboris
                    nisi ut aliquip ex ea commodo consequat.
                  </p>

                  {i % 3 === 0 && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-blue-800 font-medium">
                        🎯 Checkpoint {Math.floor(i / 3) + 1}: Try clicking the
                        cart button now!
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final Test */}
        <section className="py-16 bg-green-50">
          <div className="container max-w-2xl mx-auto text-center">
            <div className="p-8 border-2 border-green-200 rounded-lg bg-white">
              <h2 className="text-3xl font-bold text-green-800 mb-4">
                🎉 Success!
              </h2>
              <p className="text-lg text-green-700 mb-6">
                If you can see this and the header is still visible and
                functional, all fixes are working correctly!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={handleAddProduct} className="min-h-[48px]">
                  Final Test: Add Product
                </Button>
                <Button
                  onClick={() => router.push("/")}
                  variant="outline"
                  className="min-h-[48px]"
                >
                  Back to Homepage
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
