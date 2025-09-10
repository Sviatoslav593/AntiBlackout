"use client";

import { useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import PriceFilter from "@/components/PriceFilter";
import CapacityFilter from "@/components/CapacityFilter";
import { useFilters, FilterState } from "@/context/FilterContext";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Filter } from "lucide-react";

interface OriginalFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  availableCategories: string[];
  availableBrands: string[];
  selectedCategoryId?: number;
}

export default function OriginalFilters({
  filters: propFilters,
  onFiltersChange,
  availableCategories,
  availableBrands,
  selectedCategoryId,
}: OriginalFiltersProps) {
  // Use FilterContext when available, fallback to props
  const { filters: contextFilters, setFilters } = useFilters();
  const filters = contextFilters || propFilters || {
    priceRange: { min: 0, max: 10000 },
    inStockOnly: false,
    categories: [],
    brands: [],
    capacityRange: { min: 0, max: 50000 },
    usbFilters: {},
  };

  // Memoize selectedCategoryId to prevent unnecessary re-renders
  const memoizedSelectedCategoryId = useMemo(
    () => selectedCategoryId,
    [selectedCategoryId]
  );

  // Handle filter changes through context or props
  const handleFiltersChange = (newFilters: FilterState) => {
    if (setFilters && typeof setFilters === "function") {
      setFilters(newFilters);
    } else if (onFiltersChange) {
      onFiltersChange(newFilters);
    }
  };

  // Handle price filter changes
  const handlePriceChange = (priceRange: { min: number; max: number }) => {
    handleFiltersChange({
      ...filters,
      priceRange,
    });
  };

  // Handle capacity filter changes
  const handleCapacityChange = (capacityRange: {
    min: number;
    max: number;
  }) => {
    handleFiltersChange({
      ...filters,
      capacityRange,
    });
  };

  const handleCategoryToggle = async (
    category: string,
    e?: React.MouseEvent | React.TouchEvent
  ) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category];

    handleFiltersChange({
      ...filters,
      categories: newCategories,
    });
  };

  const handleBrandToggle = async (
    brand: string,
    e?: React.MouseEvent | React.TouchEvent
  ) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const newBrands = filters.brands.includes(brand)
      ? filters.brands.filter((b) => b !== brand)
      : [...filters.brands, brand];

    handleFiltersChange({
      ...filters,
      brands: newBrands,
    });
  };

  const handleInStockToggle = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    handleFiltersChange({
      ...filters,
      inStockOnly: !filters.inStockOnly,
    });
  };

  const clearFilters = () => {
    handleFiltersChange({
      priceRange: { min: 0, max: 10000 },
      inStockOnly: false,
      categories: [],
      brands: [],
      capacityRange: { min: 0, max: 50000 },
      usbFilters: {},
    });
  };

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.brands.length > 0 ||
    filters.inStockOnly ||
    filters.priceRange.min > 0 ||
    filters.priceRange.max < 10000 ||
    filters.capacityRange.min > 0 ||
    filters.capacityRange.max < 50000;

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Price Range */}
      <div className="space-y-3">
        <h4 className="font-medium">Ціна</h4>
        <PriceFilter
          priceRange={filters.priceRange}
          onPriceRangeChange={handlePriceChange}
        />
      </div>

      <Separator />

      {/* Categories */}
      {availableCategories.length > 0 && (
        <>
          <div className="space-y-3">
            <h4 className="font-medium">Категорії</h4>
            <div className="space-y-2">
              {availableCategories.map((category) => (
                <label
                  key={category}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(category)}
                    onChange={(e) => handleCategoryToggle(category, e)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">{category}</span>
                </label>
              ))}
            </div>
          </div>
          <Separator />
        </>
      )}

      {/* Brands */}
      {availableBrands.length > 0 && (
        <>
          <div className="space-y-3">
            <h4 className="font-medium">Бренди</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {availableBrands.map((brand) => (
                <label
                  key={brand}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={filters.brands.includes(brand)}
                    onChange={(e) => handleBrandToggle(brand, e)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">{brand}</span>
                </label>
              ))}
            </div>
          </div>
          <Separator />
        </>
      )}

      {/* In Stock Only */}
      <div className="space-y-3">
        <h4 className="font-medium">Наявність</h4>
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={handleInStockToggle}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm">Тільки в наявності</span>
        </label>
      </div>

      {/* Capacity Range - only for power banks */}
      {memoizedSelectedCategoryId === 1001 && (
        <>
          <Separator />
          <div className="space-y-3">
            <h4 className="font-medium">Ємність (мАг)</h4>
            <CapacityFilter
              capacityRange={filters.capacityRange}
              onCapacityRangeChange={handleCapacityChange}
            />
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Desktop Filters */}
      <div className="hidden lg:block">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Фільтри</span>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-blue-600 hover:text-blue-700"
                >
                  Очистити
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FilterContent />
          </CardContent>
        </Card>
      </div>

      {/* Mobile Filters */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-center cursor-pointer"
            >
              <Filter className="w-4 h-4 mr-2" />
              Фільтри
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2">
                  {filters.categories.length +
                    filters.brands.length +
                    (filters.inStockOnly ? 1 : 0) +
                    (filters.priceRange.min > 0 ? 1 : 0) +
                    (filters.priceRange.max < 10000 ? 1 : 0) +
                    (filters.capacityRange.min > 0 ? 1 : 0) +
                    (filters.capacityRange.max < 50000 ? 1 : 0)}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <SheetHeader>
              <SheetTitle className="flex items-center justify-between">
                <span>Фільтри</span>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Очистити
                  </Button>
                )}
              </SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
