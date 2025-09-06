"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo,
} from "react";

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

  const clearSearch = () => {
    setSearchQuery("");
  };

  const scrollToProducts = () => {
    // Add a small delay to allow DOM to update after search
    setTimeout(() => {
      const productsSection = document.getElementById("products");
      if (productsSection) {
        // Get header height to offset scroll position
        const header = document.querySelector("header");
        const headerHeight = header ? header.offsetHeight : 80; // fallback to 80px

        // Find the search results text element within the products section
        const searchResultsText = productsSection.querySelector(
          'p[class*="text-blue-600"]'
        );

        let targetElement = productsSection;
        let additionalOffset = 0;

        if (searchResultsText) {
          // If search results text exists, scroll to it instead of the section start
          targetElement = searchResultsText as HTMLElement;
          additionalOffset = -20; // Small offset to show the text nicely
        } else {
          // If no search results text, scroll to the section with more offset
          additionalOffset = 60; // More offset to show the "Знайдено X товарів" text
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
  };

  const value = useMemo(
    () => ({
      searchQuery,
      setSearchQuery,
      clearSearch,
      scrollToProducts,
    }),
    [searchQuery]
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
