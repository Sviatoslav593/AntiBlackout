"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo,
  useCallback,
  useEffect,
} from "react";
// Remove direct import of useUrlFilters to avoid Suspense issues

interface SearchContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;
  scrollToProducts: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

interface SearchProviderProps {
  children: ReactNode;
}

export function SearchProvider({ children }: SearchProviderProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const clearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  const scrollToProducts = useCallback(() => {
    // Don't auto-scroll on first page load or if no search query
    if (!searchQuery || searchQuery.trim() === "") {
      return;
    }

    // Add a small delay to allow DOM to update after search
    setTimeout(() => {
      const productsSection = document.getElementById("products");
      if (productsSection) {
        // Get header height to offset scroll position
        const header = document.querySelector("header");
        const headerHeight = header ? header.offsetHeight : 80; // fallback to 80px

        // Find the filters section within the products section
        const filtersSection = productsSection.querySelector('[class*="mb-8"]');

        let targetElement = productsSection;
        let additionalOffset = 0;

        if (filtersSection) {
          // If filters section exists, scroll to it
          targetElement = filtersSection as HTMLElement;
          additionalOffset = -20; // Small offset to show the filters nicely
        } else {
          // If no filters section, scroll to the section with more offset
          additionalOffset = 100; // More offset to show the filters area
        }

        // Calculate position accounting for fixed header
        const elementPosition = targetElement.offsetTop;
        const offsetPosition =
          elementPosition - headerHeight + additionalOffset;

        window.scrollTo({
          top: Math.max(0, offsetPosition), // Ensure we don't scroll to negative position
          behavior: "smooth",
        });
      }
    }, 150); // Small delay to allow DOM updates
  }, []);

  const value = useMemo(
    () => ({
      searchQuery,
      setSearchQuery,
      clearSearch,
      scrollToProducts,
    }),
    [searchQuery, clearSearch, scrollToProducts]
  );

  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
}
