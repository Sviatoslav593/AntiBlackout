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
    if (searchQuery !== lastSearchQuery.current) {
      lastSearchQuery.current = searchQuery;
      const newFilters = { ...activeFilters, search: searchQuery };
      setActiveFilters(newFilters);
      applyFilters(newFilters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]); // Only depend on searchQuery to avoid infinite loop
}
