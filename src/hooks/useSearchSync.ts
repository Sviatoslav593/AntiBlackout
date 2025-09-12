"use client";

import { useEffect } from "react";
import { useUrlFilters } from "./useUrlFilters";
import { useSearch } from "@/context/SearchContext";

export function useSearchSync() {
  const { searchQuery } = useSearch();
  const { activeFilters, applyFiltersAndUpdateUrl } = useUrlFilters();

  // Sync searchQuery with activeFilters
  useEffect(() => {
    if (activeFilters.search !== searchQuery) {
      const newFilters = { ...activeFilters, search: searchQuery };
      applyFiltersAndUpdateUrl(newFilters);
    }
  }, [searchQuery, activeFilters, applyFiltersAndUpdateUrl]);
}
