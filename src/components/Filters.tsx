"use client";

import { useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import PriceFilter from "@/components/PriceFilter";
import CapacitySelectFilter from "@/components/CapacitySelectFilter";
import { useFilters } from "@/context/FilterContext";
import USBCableFilters from "@/components/USBCableFilters";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Filter } from "lucide-react";

export interface FilterState {
  priceRange: {
    min: number;
    max: number;
  };
  categories: string[];
  brands: string[];
  capacityRange: {
    min: number;
    max: number;
  };
  inStockOnly: boolean;
  usbFilters: {
    inputConnector?: string;
    outputConnector?: string;
    cableLength?: string;
  };
}

interface FiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  availableCategories: string[];
  availableBrands: string[];
  priceRange: { min: number; max: number };
  capacityRange: { min: number; max: number };
  onApplyFilters?: (filterParams: {
    categoryIds?: string[];
    brandIds?: string[];
    search?: string;
    inStockOnly?: boolean;
    minPrice?: number;
    maxPrice?: number;
  }) => Promise<void>;
  selectedCategoryId?: number;
}

export default function Filters({
  filters: propFilters,
  onFiltersChange,
  availableCategories,
  availableBrands,
  priceRange,
  capacityRange,
  onApplyFilters,
  selectedCategoryId,
}: FiltersProps) {
  // Use FilterContext when available, fallback to props
  const { filters: contextFilters, setFilters } = useFilters();
  const filters = contextFilters || propFilters;

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
  const handleCapacityChange = async (capacity: number | null) => {
    const newCapacityRange = capacity ? { min: capacity, max: capacity } : { min: 0, max: 50000 };
    
    handleFiltersChange({
      ...filters,
      capacityRange: newCapacityRange,
    });

    // Apply capacity filter via API
    if (onApplyFilters) {
      console.log("Capacity filter changed:", capacity);
      const filterParams: any = {};

      if (capacity) {
        filterParams.minCapacity = capacity;
        filterParams.maxCapacity = capacity;
      }

      await onApplyFilters(filterParams);
    }
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
      : [...filters.categories, category]; // Allow multiple categories

    handleFiltersChange({
      ...filters,
      categories: newCategories,
    });

    // Apply filter via API
    if (onApplyFilters) {
      console.log("Category filter changed:", newCategories);
      // Convert category names to category IDs by fetching all products first
      try {
        const response = await fetch("/api/products");
        const data = await response.json();
        if (data.success && data.products) {
          const categoryIds = newCategories
            .map((categoryName) => {
              const product = data.products.find(
                (p: any) => p.categories?.name === categoryName
              );
              return product?.category_id;
            })
            .filter(Boolean)
            .map(String);

          const filterParams: any = {};
          if (categoryIds.length > 0) {
            filterParams.categoryIds = categoryIds;
          }
          await onApplyFilters(filterParams);
        }
      } catch (error) {
        console.error("Error getting category IDs:", error);
      }
    }
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
      : [...filters.brands, brand]; // Allow multiple brands

    handleFiltersChange({
      ...filters,
      brands: newBrands,
    });

    // Apply filter via API
    if (onApplyFilters) {
      console.log("Brand filter changed:", newBrands);
      const filterParams: any = {};
      if (newBrands.length > 0) {
        filterParams.brandIds = newBrands;
      }
      onApplyFilters(filterParams);
    }
  };

  const handleInStockToggle = async (
    e?: React.MouseEvent | React.TouchEvent
  ) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const newInStockOnly = !filters.inStockOnly;
    handleFiltersChange({
      ...filters,
      inStockOnly: newInStockOnly,
    });

    // Apply filter via API
    if (onApplyFilters) {
      console.log("In stock filter changed:", newInStockOnly);
      const filterParams: any = {};
      if (newInStockOnly) {
        filterParams.inStockOnly = true;
      }
      onApplyFilters(filterParams);
    }
  };

  const clearAllFilters = async () => {
    const clearedFilters = {
      priceRange: { min: priceRange.min, max: priceRange.max },
      categories: [],
      brands: [],
      capacityRange: { min: capacityRange.min, max: capacityRange.max },
      inStockOnly: false,
      usbFilters: {},
    };

    handleFiltersChange(clearedFilters);

    // Apply cleared filters via API
    if (onApplyFilters) {
      console.log("Clearing all filters");
      await onApplyFilters({});
    }
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (
      filters.priceRange.min > priceRange.min ||
      filters.priceRange.max < priceRange.max
    )
      count++;
    if (filters.categories.length > 0) count++;
    if (filters.brands.length > 0) count++;
    if (
      filters.capacityRange.min > capacityRange.min ||
      filters.capacityRange.max < capacityRange.max
    )
      count++;
    if (filters.inStockOnly) count++;
    return count;
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Active Filters Count */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Фільтри</h3>
        <div className="flex items-center gap-2">
          {getActiveFiltersCount() > 0 && (
            <Badge variant="secondary">{getActiveFiltersCount()}</Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="cursor-pointer"
          >
            Очистити
          </Button>
        </div>
      </div>

      {/* Price Range */}
      <PriceFilter
        value={filters.priceRange}
        onChange={handlePriceChange}
        min={priceRange.min}
        max={priceRange.max}
      />

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
                    className="rounded border-gray-300"
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
            <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {availableBrands.map((brand) => (
                <label
                  key={brand}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={filters.brands.includes(brand)}
                    onChange={(e) => handleBrandToggle(brand, e)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">{brand}</span>
                </label>
              ))}
            </div>
          </div>
          <Separator />
        </>
      )}

      {/* Capacity Select - only for power banks */}
      {(() => {
        const shouldShowCapacity =
          memoizedSelectedCategoryId === 1001 ||
          filters.categories.includes("Портативні батареї");
        return shouldShowCapacity;
      })() && (
        <>
          <CapacitySelectFilter
            onCapacityChange={handleCapacityChange}
            categoryId={memoizedSelectedCategoryId}
          />
          <Separator />
        </>
      )}

      {/* USB Cable Filters - only for cables category */}
      {(() => {
        const shouldShowUSB =
          memoizedSelectedCategoryId === 1002 ||
          filters.categories.includes("Зарядки та кабелі");
        return shouldShowUSB;
      })() && (
        <>
          <USBCableFilters
            onFiltersChange={(usb) => {
              // update context
              handleFiltersChange({
                ...filters,
                usbFilters: usb,
              });
              // apply to API
              onApplyFilters?.({
                inputConnector: usb.inputConnector,
                outputConnector: usb.outputConnector,
                cableLength: usb.cableLength,
              });
            }}
            categoryId={memoizedSelectedCategoryId}
          />
          <Separator />
        </>
      )}

      {/* In Stock Only */}
      <div className="space-y-3">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={(e) => handleInStockToggle(e)}
            className="rounded border-gray-300"
          />
          <span className="text-sm">Тільки в наявності</span>
        </label>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Filters */}
      <div className="hidden lg:block">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Фільтри товарів</CardTitle>
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
            <Button variant="outline" className="cursor-pointer">
              <Filter className="h-4 w-4 mr-2" />
              Фільтри
              {getActiveFiltersCount() > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {getActiveFiltersCount()}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 overflow-y-auto">
            <SheetHeader className="sticky top-0 bg-background pb-4 border-b px-6">
              <SheetTitle>Фільтри товарів</SheetTitle>
            </SheetHeader>
            <div className="mt-6 pb-6 px-6">
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
