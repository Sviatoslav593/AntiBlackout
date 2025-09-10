"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export interface FilterState {
  priceRange: { min: number; max: number };
  inStockOnly: boolean;
  categories: string[];
  brands: string[];
  capacityRange: { min: number; max: number };
  // usbFilters: {
  //   inputConnector?: string;
  //   outputConnector?: string;
  //   cableLength?: string;
  // };
}

interface FilterContextType {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  clearFilters: () => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

interface FilterProviderProps {
  children: ReactNode;
  initialFilters?: FilterState;
}

export function FilterProvider({
  children,
  initialFilters,
}: FilterProviderProps) {
  const [filters, setFilters] = useState<FilterState>(
    initialFilters || {
      priceRange: { min: 0, max: 10000 },
      inStockOnly: false,
      categories: [],
      brands: [],
      capacityRange: { min: 0, max: 50000 },
      // usbFilters: {},
    }
  );

  const clearFilters = () => {
    setFilters({
      priceRange: { min: 0, max: 10000 },
      inStockOnly: false,
      categories: [],
      brands: [],
      capacityRange: { min: 0, max: 50000 },
      // usbFilters: {},
    });
  };

  return (
    <FilterContext.Provider value={{ filters, setFilters, clearFilters }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FilterContext);
  if (context === undefined) {
    // Return default values during SSR/prerendering
    return {
      filters: {
        priceRange: { min: 0, max: 10000 },
        inStockOnly: false,
        categories: [],
        brands: [],
        capacityRange: { min: 0, max: 50000 },
        // usbFilters: {},
      },
      setFilters: () => {},
      clearFilters: () => {},
    };
  }
  return context;
}
