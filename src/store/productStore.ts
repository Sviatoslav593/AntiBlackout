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
  categoryId: string;
  inStock: boolean;
  stockQuantity: number;
  rating: number;
  reviewCount: number;
  specifications: Record<string, any>;
  characteristics?: Record<string, any>;
  external_id?: string;
  slug?: string;
  created_at?: string;
  updated_at?: string;
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
  categoryIds: ["1001"], // Default to power banks
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

        // If same filters, don't refetch
        if (newFilterKey === state.lastFilterKey) {
          return;
        }

        set({
          activeFilters: filters,
          lastFilterKey: newFilterKey,
          currentPage: 1,
          hasMoreProducts: true,
        });

        // Apply client-side filtering
        const filtered = state.allProducts.filter((product) => {
          // Category filter
          if (filters.categoryIds && filters.categoryIds.length > 0) {
            console.log(
              "Category filter:",
              filters.categoryIds,
              "Product categoryId:",
              product.categoryId
            );
            if (!filters.categoryIds.includes(product.categoryId)) {
              return false;
            }
          }

          // Brand filter
          if (filters.brandIds && filters.brandIds.length > 0) {
            console.log(
              "Brand filter:",
              filters.brandIds,
              "Product brand:",
              product.brand
            );
            if (!filters.brandIds.includes(product.brand)) {
              return false;
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

          // Price filter
          if (filters.minPrice && product.price < filters.minPrice) {
            return false;
          }
          if (filters.maxPrice && product.price > filters.maxPrice) {
            return false;
          }

          // Capacity filter (for power banks)
          if (filters.minCapacity || filters.maxCapacity) {
            const capacity =
              product.characteristics?.["Ємність акумулятора, mah"];
            if (capacity) {
              const capacityNum = parseFloat(capacity.toString());
              if (filters.minCapacity && capacityNum < filters.minCapacity) {
                return false;
              }
              if (filters.maxCapacity && capacityNum > filters.maxCapacity) {
                return false;
              }
            }
          }

          // USB filters (for cables)
          if (filters.inputConnector) {
            const inputConnector =
              product.characteristics?.["Вхід (Тип коннектора)"];
            if (inputConnector !== filters.inputConnector) {
              return false;
            }
          }

          if (filters.outputConnector) {
            const outputConnector =
              product.characteristics?.["Вихід (Тип коннектора)"];
            if (outputConnector !== filters.outputConnector) {
              return false;
            }
          }

          if (filters.cableLength) {
            const cableLength = product.characteristics?.["Довжина кабелю, м"];
            if (cableLength !== filters.cableLength) {
              return false;
            }
          }

          return true;
        });

        set({ filteredProducts: filtered });
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
