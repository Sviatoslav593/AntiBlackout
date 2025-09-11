import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback, useEffect } from "react";
import { useProductStore } from "@/store/productStore";
import { FilterParams } from "@/store/productStore";

export function useUrlFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { activeFilters, setActiveFilters, applyFilters } = useProductStore();

  // Parse URL parameters to filter state
  const parseUrlToFilters = useCallback((): FilterParams => {
    const filters: FilterParams = {
      categoryIds: [], // Default to empty array
      brandIds: [], // Default to empty array
    };

    // Category IDs
    const categoryIds = searchParams.get("categoryIds");
    if (categoryIds) {
      filters.categoryIds = categoryIds.split(",").filter(Boolean);
    }

    // Brand IDs
    const brandIds = searchParams.get("brandIds");
    if (brandIds) {
      filters.brandIds = brandIds.split(",").filter(Boolean);
    }

    // Search
    const search = searchParams.get("search");
    if (search) {
      filters.search = search;
    }

    // Stock filter
    const inStockOnly = searchParams.get("inStock");
    if (inStockOnly === "true") {
      filters.inStockOnly = true;
    }

    // Price range
    const minPrice = searchParams.get("minPrice");
    if (minPrice) {
      filters.minPrice = parseFloat(minPrice);
    }

    const maxPrice = searchParams.get("maxPrice");
    if (maxPrice) {
      filters.maxPrice = parseFloat(maxPrice);
    }

    // Capacity range (for power banks)
    const minCapacity = searchParams.get("minCapacity");
    if (minCapacity) {
      filters.minCapacity = parseFloat(minCapacity);
    }

    const maxCapacity = searchParams.get("maxCapacity");
    if (maxCapacity) {
      filters.maxCapacity = parseFloat(maxCapacity);
    }

    // USB filters (for cables)
    const inputConnector = searchParams.get("inputConnector");
    if (inputConnector) {
      filters.inputConnector = inputConnector;
    }

    const outputConnector = searchParams.get("outputConnector");
    if (outputConnector) {
      filters.outputConnector = outputConnector;
    }

    const cableLength = searchParams.get("cableLength");
    if (cableLength) {
      filters.cableLength = cableLength;
    }

    // Sort
    const sort = searchParams.get("sort");
    if (sort) {
      useProductStore.getState().setSortBy(sort);
    }

    return filters;
  }, [searchParams]);

  // Update URL with current filter state
  const updateUrl = useCallback(
    (filters: FilterParams) => {
      const params = new URLSearchParams();

      // Add filter parameters to URL
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== "" && value !== null) {
          if (Array.isArray(value)) {
            // Always add arrays, even if empty (for categoryIds and brandIds)
            if (key === "categoryIds" || key === "brandIds") {
              params.append(key, value.join(","));
            } else if (value.length > 0) {
              params.append(key, value.join(","));
            }
          } else if (typeof value === "boolean") {
            if (value) {
              params.append(key, "true");
            }
          } else {
            params.append(key, value.toString());
          }
        }
      });

      // Add sort parameter
      const currentSort = useProductStore.getState().sortBy;
      if (currentSort && currentSort !== "popularity-desc") {
        params.append("sort", currentSort);
      }

      // Update URL without page reload
      const newUrl = params.toString()
        ? `${pathname}?${params.toString()}`
        : pathname;
      router.replace(newUrl, { scroll: false });
    },
    [pathname, router]
  );

  // Apply filters and update URL
  const applyFiltersAndUpdateUrl = useCallback(
    (filters: FilterParams) => {
      setActiveFilters(filters);
      applyFilters(filters);
      updateUrl(filters);
    },
    [setActiveFilters, applyFilters, updateUrl]
  );

  // Clear all filters
  const clearFilters = useCallback(() => {
    const defaultFilters: FilterParams = {
      categoryIds: [], // Clear all categories
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

    console.log("Clearing filters:", defaultFilters);
    setActiveFilters(defaultFilters);
    applyFilters(defaultFilters);
    updateUrl(defaultFilters);
  }, [setActiveFilters, applyFilters, updateUrl]);

  // Sync URL parameters on mount and when URL changes
  useEffect(() => {
    const urlFilters = parseUrlToFilters();

    // Only update if filters are different from current state
    const currentFiltersStr = JSON.stringify(activeFilters);
    const urlFiltersStr = JSON.stringify(urlFilters);

    if (currentFiltersStr !== urlFiltersStr) {
      setActiveFilters(urlFilters);
      applyFilters(urlFilters);
    }
  }, [searchParams, parseUrlToFilters, setActiveFilters, applyFilters]); // Fixed: removed activeFilters from dependencies

  // Apply default filters on mount if no URL parameters
  useEffect(() => {
    const hasUrlParams = searchParams.toString().length > 0;
    if (!hasUrlParams && activeFilters.categoryIds === undefined) {
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
      console.log("Setting default filters:", defaultFilters);
      setActiveFilters(defaultFilters);
      applyFilters(defaultFilters);
      updateUrl(defaultFilters);
    }
  }, [
    searchParams,
    setActiveFilters,
    applyFilters,
    updateUrl,
    activeFilters.categoryIds,
  ]);

  return {
    activeFilters,
    applyFiltersAndUpdateUrl,
    clearFilters,
    updateUrl,
  };
}
