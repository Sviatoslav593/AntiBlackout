"use client";

import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";

export default function HeaderTestPage() {
  const { addItem, state } = useCart();

  const testProduct = {
    id: 888,
    name: "Header Test Product",
    description: "For testing header functionality",
    price: 1000,
    image:
      "https://images.unsplash.com/photo-1609592234174-0a8f6b6f6a0e?w=400&h=400&fit=crop",
    rating: 5,
    reviewCount: 50,
    inStock: true,
    capacity: 15000,
    brand: "TestBrand",
    popularity: 5,
    createdAt: "2025-01-01",
    category: "powerbank",
  };

  const handleAddProduct = () => {
    addItem(testProduct);
  };

  return (
    <Layout>
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="text-4xl font-bold">Header & Cart Test</h1>

          <div className="p-6 border rounded-lg bg-muted/50">
            <h2 className="text-2xl font-semibold mb-4">Cart Status</h2>
            <div className="space-y-2">
              <p>
                Items in cart: <strong>{state.itemCount}</strong>
              </p>
              <p>
                Total: <strong>{state.total} ₴</strong>
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Test Actions</h2>
            <Button
              onClick={handleAddProduct}
              className="w-full sm:w-auto min-h-[48px] px-8"
            >
              Add Test Product (Watch Cart Icon!)
            </Button>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Instructions</h2>
            <div className="p-4 border rounded-lg">
              <ol className="list-decimal list-inside space-y-2">
                <li>
                  <strong>Scroll down</strong> - Header should stay at top
                  (sticky)
                </li>
                <li>
                  <strong>Click "Add Test Product"</strong> - Cart icon should
                  animate
                </li>
                <li>
                  <strong>Click cart icon</strong> in header - Drawer should
                  open
                </li>
                <li>
                  <strong>Click mobile menu</strong> (on mobile) - Menu should
                  slide down
                </li>
                <li>
                  <strong>Try navigation links</strong> - Should work properly
                </li>
              </ol>
            </div>
          </div>

          {/* Add lots of content to test scrolling */}
          <div className="space-y-8">
            <h2 className="text-2xl font-semibold">Scroll Test Content</h2>
            {Array.from({ length: 20 }, (_, i) => (
              <div key={i} className="p-6 border rounded-lg">
                <h3 className="text-xl font-semibold mb-2">Section {i + 1}</h3>
                <p className="text-muted-foreground">
                  This is test content to make the page long enough to test
                  scrolling. The header should remain sticky and visible at the
                  top of the page when you scroll down. Lorem ipsum dolor sit
                  amet, consectetur adipiscing elit. Sed do eiusmod tempor
                  incididunt ut labore et dolore magna aliqua.
                </p>
              </div>
            ))}
          </div>

          <div className="p-6 border rounded-lg bg-green-50 border-green-200">
            <h3 className="text-xl font-semibold text-green-800 mb-2">
              ✅ If you can see this, scrolling works!
            </h3>
            <p className="text-green-700">
              And if the header is still visible at the top, sticky positioning
              works too!
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
