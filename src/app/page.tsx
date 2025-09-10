import { Suspense } from "react";
import Layout from "@/components/Layout";
import HomePageClient from "@/components/HomePageClient";

// Loading component for Suspense fallback
function ProductsLoading() {
  return (
    <div className="py-16 bg-gray-50">
      <div className="container">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 space-y-4 lg:space-y-0">
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              Наші товари
            </h2>
            <p className="text-gray-600">Завантаження...</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar Skeleton */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid Skeleton */}
          <div className="lg:w-3/4">
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
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Layout>
      <Suspense fallback={<ProductsLoading />}>
        <HomePageClient />
      </Suspense>
    </Layout>
  );
}