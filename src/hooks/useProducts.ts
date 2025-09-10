import { useEffect, useCallback } from "react";
import { useProductStore } from "@/store/productStore";
import { FilterParams } from "@/store/productStore";

export function useProducts() {
  const {
    allProducts,
    filteredProducts,
    categories,
    brands,
    isLoading,
    isLoadingMore,
    hasMoreProducts,
    currentPage,
    setProducts,
    setCategories,
    setBrands,
    setLoading,
    loadMoreProducts,
    resetProductState,
  } = useProductStore();

  // Initial data fetch
  const fetchInitialData = useCallback(async () => {
    // Only fetch if we don't have products yet
    if (allProducts.length > 0) {
      return;
    }

    setLoading(true);

    try {
      // Fetch products, categories, and brands in parallel
      const [productsResponse, categoriesResponse, brandsResponse] =
        await Promise.all([
          fetch("/api/products?categoryId=1001&limit=100"), // Load more initially
          fetch("/api/categories"),
          fetch("/api/brands"),
        ]);

      const [productsData, categoriesData, brandsData] = await Promise.all([
        productsResponse.json(),
        categoriesResponse.json(),
        brandsResponse.json(),
      ]);

      if (productsData.success && productsData.products) {
        setProducts(productsData.products);
        console.log("Loaded products from API:", productsData.products.length);
      }

      if (categoriesData.success && categoriesData.categories) {
        const categoryNames = categoriesData.categories.map(
          (cat: any) => cat.name
        );
        setCategories(categoryNames);
        console.log("Loaded categories:", categoryNames);
      }

      if (brandsData.success && brandsData.brands) {
        setBrands(brandsData.brands);
        console.log("Loaded brands:", brandsData.brands);
      }
    } catch (error) {
      console.error("Error fetching initial data:", error);
    } finally {
      setLoading(false);
    }
  }, [allProducts.length, setProducts, setCategories, setBrands, setLoading]);

  // Fetch products with specific filters
  const fetchProductsWithFilters = useCallback(
    async (filters: FilterParams) => {
      setLoading(true);

      try {
        const queryParams = new URLSearchParams();

        // Add filter parameters to query
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== "" && value !== null) {
            if (Array.isArray(value)) {
              queryParams.append(key, value.join(","));
            } else {
              queryParams.append(key, value.toString());
            }
          }
        });

        queryParams.append("limit", "100");

        const response = await fetch(`/api/products?${queryParams.toString()}`);
        const data = await response.json();

        if (data.success && data.products) {
          setProducts(data.products);
          console.log("Fetched products with filters:", data.products.length);
        }
      } catch (error) {
        console.error("Error fetching products with filters:", error);
      } finally {
        setLoading(false);
      }
    },
    [setProducts, setLoading]
  );

  // Load more products
  const handleLoadMore = useCallback(async () => {
    if (!isLoadingMore && hasMoreProducts) {
      await loadMoreProducts();
    }
  }, [isLoadingMore, hasMoreProducts, loadMoreProducts]);

  // Reset products (for manual refresh)
  const refreshProducts = useCallback(() => {
    resetProductState();
    fetchInitialData();
  }, [resetProductState, fetchInitialData]);

  // Load initial data on mount
  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  return {
    // Data
    allProducts,
    filteredProducts,
    categories,
    brands,

    // Loading states
    isLoading,
    isLoadingMore,
    hasMoreProducts,
    currentPage,

    // Actions
    fetchProductsWithFilters,
    handleLoadMore,
    refreshProducts,
  };
}
