import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  images?: string[];
  brand: string;
  category: string;
  categoryId?: string;
  category_id?: number;
  inStock: boolean;
  stockQuantity?: number;
  rating: number;
  reviewCount: number;
  specifications?: Record<string, any>;
  characteristics?: Record<string, any>;
  external_id?: string;
  slug?: string;
  created_at?: string;
  updated_at?: string;
  capacity?: number;
  popularity?: number;
  vendor_code?: string;
  quantity?: number;
  categories?: {
    id: number;
    name: string;
    parent_id?: number;
  };
}

export interface FilterParams {
  categoryIds?: string[];
  brandIds?: string[];
  search?: string;
  inStockOnly?: boolean;
  minPrice?: number;
  maxPrice?: number;
  minCapacity?: number;
  maxCapacity?: number;
  inputConnector?: string;
  outputConnector?: string;
  cableLength?: string;
}

export interface ProductState {
  // Products data
  allProducts: Product[];
  filteredProducts: Product[];
  categories: string[];
  brands: string[];

  // Loading states
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMoreProducts: boolean;

  // Pagination
  currentPage: number;
  totalProducts: number;

  // Filter state
  activeFilters: FilterParams;
  sortBy: string;

  // UI state
  scrollPosition: number;
  lastFilterKey: string;

  // Actions
  setProducts: (products: Product[]) => void;
  setFilteredProducts: (products: Product[]) => void;
  appendProducts: (products: Product[]) => void;
  setCategories: (categories: string[]) => void;
  setBrands: (brands: string[]) => void;
  setLoading: (loading: boolean) => void;
  setLoadingMore: (loading: boolean) => void;
  setHasMoreProducts: (hasMore: boolean) => void;
  setCurrentPage: (page: number) => void;
  setTotalProducts: (total: number) => void;
  setActiveFilters: (filters: FilterParams) => void;
  setSortBy: (sort: string) => void;
  setScrollPosition: (position: number) => void;
  setLastFilterKey: (key: string) => void;

  // Complex actions
  applyFilters: (filters: FilterParams) => void;
  clearFilters: () => void;
  loadMoreProducts: () => Promise<void>;
  resetProductState: () => void;
}

const defaultFilters: FilterParams = {
  categoryIds: [], // No default categories
  brandIds: [],
  search: "",
  inStockOnly: false,
  minPrice: 0,
  maxPrice: 10000,
  minCapacity: 0,
  maxCapacity: 50000,
  inputConnector: "",
  outputConnector: "",
  cableLength: "",
};

export const useProductStore = create<ProductState>()(
  persist(
    (set, get) => ({
      // Initial state
      allProducts: [],
      filteredProducts: [],
      categories: [],
      brands: [],
      isLoading: false,
      isLoadingMore: false,
      hasMoreProducts: true,
      currentPage: 1,
      totalProducts: 0,
      activeFilters: defaultFilters,
      sortBy: "popularity-desc",
      scrollPosition: 0,
      lastFilterKey: "",

      // Basic setters
      setProducts: (products) => set({ allProducts: products }),
      setFilteredProducts: (products) => set({ filteredProducts: products }),
      appendProducts: (products) =>
        set((state) => ({
          allProducts: [...state.allProducts, ...products],
          filteredProducts: [...state.filteredProducts, ...products],
        })),
      setCategories: (categories) => set({ categories }),
      setBrands: (brands) => set({ brands }),
      setLoading: (isLoading) => set({ isLoading }),
      setLoadingMore: (isLoadingMore) => set({ isLoadingMore }),
      setHasMoreProducts: (hasMoreProducts) => set({ hasMoreProducts }),
      setCurrentPage: (currentPage) => set({ currentPage }),
      setTotalProducts: (totalProducts) => set({ totalProducts }),
      setActiveFilters: (activeFilters) => set({ activeFilters }),
      setSortBy: (sortBy) => set({ sortBy }),
      setScrollPosition: (scrollPosition) => set({ scrollPosition }),
      setLastFilterKey: (lastFilterKey) => set({ lastFilterKey }),

      // Complex actions
      applyFilters: (filters) => {
        const state = get();
        const newFilterKey = JSON.stringify(filters);

        console.log("applyFilters called with:", filters);
        console.log("Current lastFilterKey:", state.lastFilterKey);
        console.log("New filterKey:", newFilterKey);

        // If same filters, don't refetch
        if (newFilterKey === state.lastFilterKey) {
          console.log("Same filters, skipping", {
            newFilterKey,
            lastFilterKey: state.lastFilterKey,
            allProducts: state.allProducts.length,
            filteredProducts: state.filteredProducts.length,
          });
          return;
        }

        console.log("Applying new filters");
        set({
          activeFilters: filters,
          lastFilterKey: newFilterKey,
          currentPage: 1,
          hasMoreProducts: true,
        });

        // Create reliable category mapping (both ways)
        const categoryIdToNameMap: Record<string, string> = {
          "1001": "Портативні батареї",
          "1002": "Зарядки та кабелі",
          "1": "Акумулятори та powerbank",
          "15": "Мережеві зарядні пристрої",
          "16": "Кабелі usb",
          "80": "Бездротові зарядні пристрої",
        };

        const categoryNameToIdMap: Record<string, string> = {
          "Портативні батареї": "1001",
          "Зарядки та кабелі": "1002",
          "Акумулятори та powerbank": "1",
          "Мережеві зарядні пристрої": "15",
          "Кабелі usb": "16",
          "Бездротові зарядні пристрої": "80",
        };

        // Apply client-side filtering
        console.log("Starting filtering with:", {
          totalProducts: state.allProducts.length,
          filters: filters,
          categoryIds: filters.categoryIds,
          brandIds: filters.brandIds,
        });

        console.log("Filtering products:", 
          "totalProducts:", state.allProducts.length,
          "filters:", JSON.stringify(filters, null, 2),
          "categoryIds:", filters.categoryIds,
          "brandIds:", filters.brandIds
        );

        const filtered = state.allProducts.filter((product) => {
          console.log(`Filtering product: ${product.name}`, 
          "categoryId:", product.category_id,
          "category:", product.category,
          "brand:", product.brand,
          "price:", product.price
        );

          // Category filter - only apply if there are selected categories
          if (filters.categoryIds && filters.categoryIds.length > 0) {
            console.log("Category filter:", {
              selectedCategoryIds: filters.categoryIds,
              productCategoryId: product.category_id,
              productCategoryName: product.category,
            });

            // Get product's category ID
            const productCategoryId = product.category_id?.toString();

            if (!productCategoryId) {
              console.log("Product has no category_id:", product.name);
              return false;
            }

            // Check if any selected category ID matches the product's category ID
            const categoryMatch = filters.categoryIds.some(
              (selectedCategoryId) => {
                console.log(
                  `Checking category match: "${selectedCategoryId}" vs "${productCategoryId}"`
                );

                // Direct ID match
                if (selectedCategoryId === productCategoryId) {
                  console.log(
                    `✅ Category match by ID: ${selectedCategoryId} === ${productCategoryId}`
                  );
                  return true;
                }

                // Name to ID mapping match (if selectedCategoryId is a name)
                const mappedId = categoryNameToIdMap[selectedCategoryId];
                if (mappedId && mappedId === productCategoryId) {
                  console.log(
                    `✅ Category match by mapping: ${selectedCategoryId} → ${mappedId} === ${productCategoryId}`
                  );
                  return true;
                }

                console.log(
                  `❌ No category match: ${selectedCategoryId} vs ${productCategoryId}`
                );
                return false;
              }
            );

            if (!categoryMatch) {
              console.log("Product filtered out by category:", product.name);
              return false;
            }
          }

          // Brand filter - only apply if there are selected brands
          if (filters.brandIds && filters.brandIds.length > 0) {
            console.log("Brand filter:", {
              selectedBrands: filters.brandIds,
              productBrand: product.brand,
            });

            // Clean and normalize brand names for comparison
            const productBrand = product.brand?.trim()?.toLowerCase() || "";
            const selectedBrands = filters.brandIds.map((brand) =>
              brand.trim().toLowerCase()
            );

            console.log(
              `Checking brand match: "${productBrand}" in [${selectedBrands.join(
                ", "
              )}]`
            );

            const brandMatch = selectedBrands.includes(productBrand);

            if (!brandMatch) {
              console.log(
                `Product filtered out by brand: ${product.name} (${productBrand} not in ${selectedBrands})`
              );
              return false;
            } else {
              console.log(`✅ Brand match: ${product.name} (${productBrand})`);
            }
          }

          // Search filter
          if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            if (
              !product.name.toLowerCase().includes(searchLower) &&
              !product.description.toLowerCase().includes(searchLower) &&
              !product.brand.toLowerCase().includes(searchLower)
            ) {
              return false;
            }
          }

          // Stock filter
          if (filters.inStockOnly && !product.inStock) {
            return false;
          }

          // Price filter - only apply if price range is set
          if (filters.minPrice > 0 && product.price < filters.minPrice) {
            console.log(
              `Product ${product.name} filtered out by minPrice: ${product.price} < ${filters.minPrice}`
            );
            return false;
          }
          if (filters.maxPrice < 10000 && product.price > filters.maxPrice) {
            console.log(
              `Product ${product.name} filtered out by maxPrice: ${product.price} > ${filters.maxPrice}`
            );
            return false;
          }

          // Capacity filter (for power banks) - only apply if capacity range is set
          if (filters.minCapacity > 0 || filters.maxCapacity < 50000) {
            const capacity = product.capacity || 0;
            if (capacity > 0) {
              if (filters.minCapacity && capacity < filters.minCapacity) {
                return false;
              }
              if (filters.maxCapacity && capacity > filters.maxCapacity) {
                return false;
              }
            } else {
              // If no capacity specified and we're filtering by capacity, skip this product
              return false;
            }
          }

          // USB filters (for cables) - only apply if filters are set
          if (filters.inputConnector && filters.inputConnector !== "") {
            const inputConnector =
              product.characteristics?.["Вхід (Тип коннектора)"];
            if (!inputConnector || inputConnector !== filters.inputConnector) {
              console.log(
                `Product ${product.name} filtered out: inputConnector ${inputConnector} !== ${filters.inputConnector}`
              );
              return false;
            }
          }

          if (filters.outputConnector && filters.outputConnector !== "") {
            const outputConnector =
              product.characteristics?.["Вихід (Тип коннектора)"];
            if (
              !outputConnector ||
              outputConnector !== filters.outputConnector
            ) {
              console.log(
                `Product ${product.name} filtered out: outputConnector ${outputConnector} !== ${filters.outputConnector}`
              );
              return false;
            }
          }

          if (filters.cableLength && filters.cableLength !== "") {
            const cableLength = product.characteristics?.["Довжина кабелю, м"];
            const cableLengthStr = cableLength?.toString();
            const filterLengthStr = filters.cableLength.toString();
            if (!cableLengthStr || cableLengthStr !== filterLengthStr) {
              console.log(
                `Product ${product.name} filtered out: cableLength ${cableLengthStr} !== ${filterLengthStr}`
              );
              return false;
            }
          }

          console.log(`✅ Product passed all filters: ${product.name}`);
          return true;
        });

        console.log(
          `Filtering complete: ${filtered.length} products out of ${state.allProducts.length}`
        );
        console.log(
          "Filtered products sample:",
          filtered.slice(0, 3).map((p) => ({
            name: p.name,
            category: p.category,
            brand: p.brand,
          }))
        );
        console.log(
          "Filtered products sample:",
          filtered.slice(0, 3).map((p) => ({
            name: p.name,
            category_id: p.category_id,
            category: p.category,
            brand: p.brand,
          }))
        );

        set({
          filteredProducts: filtered,
          allProducts: state.allProducts, // Ensure allProducts is preserved
        });
      },

      clearFilters: () => {
        set({
          activeFilters: defaultFilters,
          lastFilterKey: "",
          currentPage: 1,
          hasMoreProducts: true,
        });
        get().applyFilters(defaultFilters);
      },

      loadMoreProducts: async () => {
        const state = get();
        if (state.isLoadingMore || !state.hasMoreProducts) return;

        set({ isLoadingMore: true });

        try {
          const nextPage = state.currentPage + 1;
          const queryParams = new URLSearchParams();

          // Add filter parameters to query
          Object.entries(state.activeFilters).forEach(([key, value]) => {
            if (value !== undefined && value !== "" && value !== null) {
              if (Array.isArray(value)) {
                queryParams.append(key, value.join(","));
              } else {
                queryParams.append(key, value.toString());
              }
            }
          });

          queryParams.append("page", nextPage.toString());
          queryParams.append("limit", "50");

          const response = await fetch(
            `/api/products?${queryParams.toString()}`
          );
          const data = await response.json();

          if (data.success && data.products) {
            get().appendProducts(data.products);
            set({
              currentPage: nextPage,
              hasMoreProducts: data.products.length === 50,
            });
          }
        } catch (error) {
          console.error("Error loading more products:", error);
        } finally {
          set({ isLoadingMore: false });
        }
      },

      resetProductState: () => {
        set({
          allProducts: [],
          filteredProducts: [],
          categories: [],
          brands: [],
          isLoading: false,
          isLoadingMore: false,
          hasMoreProducts: true,
          currentPage: 1,
          totalProducts: 0,
          activeFilters: defaultFilters,
          sortBy: "popularity-desc",
          scrollPosition: 0,
          lastFilterKey: "",
        });
      },
    }),
    {
      name: "product-store",
      partialize: (state) => ({
        allProducts: state.allProducts,
        categories: state.categories,
        brands: state.brands,
        activeFilters: state.activeFilters,
        sortBy: state.sortBy,
        scrollPosition: state.scrollPosition,
      }),
    }
  )
);
