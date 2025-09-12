"use client";

import { useEffect, useRef } from "react";
import { useSearch } from "@/context/SearchContext";
import { useProductStore } from "@/store/productStore";

export function useSearchSync() {
  const { searchQuery } = useSearch();
  const { activeFilters, setActiveFilters, applyFilters } = useProductStore();
  const lastSearchQuery = useRef(searchQuery);

  // Sync searchQuery with activeFilters (only when searchQuery changes)
  useEffect(() => {
    console.log("useSearchSync: searchQuery changed:", {
      searchQuery,
      lastSearchQuery: lastSearchQuery.current,
      activeFiltersSearch: activeFilters.search,
      isDifferent: searchQuery !== lastSearchQuery.current
    });

    if (searchQuery !== lastSearchQuery.current) {
      console.log("useSearchSync: searchQuery is different, updating...");
      lastSearchQuery.current = searchQuery;
      
      // Get fresh state to avoid stale closure
      const currentState = useProductStore.getState();
      const newFilters = { ...currentState.activeFilters, search: searchQuery };
      
      console.log("useSearchSync: Current activeFilters:", currentState.activeFilters);
      console.log("useSearchSync: New filters to apply:", newFilters);
      
      setActiveFilters(newFilters);
      applyFilters(newFilters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]); // Only depend on searchQuery to avoid infinite loop
}
