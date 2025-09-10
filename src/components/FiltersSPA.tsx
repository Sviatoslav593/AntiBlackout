"use client";

import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PriceFilter from "@/components/PriceFilter";
import CapacitySelectFilter from "@/components/CapacitySelectFilter";
import USBCableFilters from "@/components/USBCableFilters";
import { useUrlFilters } from "@/hooks/useUrlFilters";
import { useProductStore } from "@/store/productStore";
import { FilterParams } from "@/store/productStore";

interface FiltersSPAProps {
  availableCategories?: string[];
  availableBrands?: string[];
  priceRange: { min: number; max: number };
  capacityRange: { min: number; max: number };
  isMobile?: boolean;
}

export default function FiltersSPA({
  availableCategories,
  availableBrands,
  priceRange,
  capacityRange,
  isMobile = false,
}: FiltersSPAProps) {
  const { activeFilters, applyFiltersAndUpdateUrl, clearFilters } =
    useUrlFilters();
  const { setSortBy } = useProductStore();
  const [localFilters, setLocalFilters] = useState<FilterParams>(activeFilters);

  // Update local filters when URL filters change
  useMemo(() => {
    setLocalFilters(activeFilters);
  }, [activeFilters]);

  // Handle category toggle
  const handleCategoryToggle = useCallback(
    (category: string) => {
      const newCategories = localFilters.categoryIds || [];
      const updatedCategories = newCategories.includes(category)
        ? newCategories.filter((c) => c !== category)
        : [...newCategories, category];

      const newFilters = {
        ...localFilters,
        categoryIds: updatedCategories,
      };

      setLocalFilters(newFilters);
      applyFiltersAndUpdateUrl(newFilters);
    },
    [localFilters, applyFiltersAndUpdateUrl]
  );

  // Handle brand toggle
  const handleBrandToggle = useCallback(
    (brand: string) => {
      const newBrands = localFilters.brandIds || [];
      const updatedBrands = newBrands.includes(brand)
        ? newBrands.filter((b) => b !== brand)
        : [...newBrands, brand];

      const newFilters = {
        ...localFilters,
        brandIds: updatedBrands,
      };

      setLocalFilters(newFilters);
      applyFiltersAndUpdateUrl(newFilters);
    },
    [localFilters, applyFiltersAndUpdateUrl]
  );

  // Handle price change
  const handlePriceChange = useCallback(
    (priceRange: { min: number; max: number }) => {
      const newFilters = {
        ...localFilters,
        minPrice: priceRange.min,
        maxPrice: priceRange.max,
      };

      setLocalFilters(newFilters);
      applyFiltersAndUpdateUrl(newFilters);
    },
    [localFilters, applyFiltersAndUpdateUrl]
  );

  // Handle capacity change
  const handleCapacityChange = useCallback(
    (capacity: string) => {
      let newFilters = { ...localFilters };

      if (capacity === "all" || capacity === "") {
        newFilters = {
          ...newFilters,
          minCapacity: undefined,
          maxCapacity: undefined,
        };
      } else {
        const capacityNum = parseFloat(capacity);
        newFilters = {
          ...newFilters,
          minCapacity: capacityNum,
          maxCapacity: capacityNum,
        };
      }

      setLocalFilters(newFilters);
      applyFiltersAndUpdateUrl(newFilters);
    },
    [localFilters, applyFiltersAndUpdateUrl]
  );

  // Handle USB filter changes
  const handleUSBFiltersChange = useCallback(
    (usbFilters: {
      inputConnector?: string;
      outputConnector?: string;
      cableLength?: string;
    }) => {
      const newFilters = {
        ...localFilters,
        inputConnector: usbFilters.inputConnector || "",
        outputConnector: usbFilters.outputConnector || "",
        cableLength: usbFilters.cableLength || "",
      };

      setLocalFilters(newFilters);
      applyFiltersAndUpdateUrl(newFilters);
    },
    [localFilters, applyFiltersAndUpdateUrl]
  );

  // Handle stock filter
  const handleStockToggle = useCallback(() => {
    const newFilters = {
      ...localFilters,
      inStockOnly: !localFilters.inStockOnly,
    };

    setLocalFilters(newFilters);
    applyFiltersAndUpdateUrl(newFilters);
  }, [localFilters, applyFiltersAndUpdateUrl]);

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    clearFilters();
  }, [clearFilters]);

  // Get active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;

    if (localFilters.categoryIds && localFilters.categoryIds.length > 0)
      count++;
    if (localFilters.brandIds && localFilters.brandIds.length > 0) count++;
    if (localFilters.minPrice && localFilters.minPrice > 0) count++;
    if (localFilters.maxPrice && localFilters.maxPrice < 10000) count++;
    if (localFilters.minCapacity || localFilters.maxCapacity) count++;
    if (localFilters.inputConnector) count++;
    if (localFilters.outputConnector) count++;
    if (localFilters.cableLength) count++;
    if (localFilters.inStockOnly) count++;

    return count;
  }, [localFilters]);

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      {availableCategories && availableCategories.length > 0 && (
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
                  checked={
                    localFilters.categoryIds?.includes(category) || false
                  }
                  onChange={() => handleCategoryToggle(category)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">{category}</span>
              </label>
            ))}
          </div>
          <Separator />
        </div>
      )}

      {/* Brands */}
      {availableBrands && availableBrands.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium">Бренди</h4>
          <div className="space-y-2">
            {availableBrands.map((brand) => (
              <label
                key={brand}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={localFilters.brandIds?.includes(brand) || false}
                  onChange={() => handleBrandToggle(brand)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">{brand}</span>
              </label>
            ))}
          </div>
          <Separator />
        </div>
      )}

      {/* Price Filter */}
      <div className="space-y-3">
        <h4 className="font-medium">Ціна</h4>
        <PriceFilter
          value={{
            min: localFilters.minPrice || priceRange.min,
            max: localFilters.maxPrice || priceRange.max,
          }}
          onChange={handlePriceChange}
          min={priceRange.min}
          max={priceRange.max}
        />
      </div>
      <Separator />

      {/* Capacity Filter - always visible */}
      <div className="space-y-3">
        <h4 className="font-medium">Ємність павербанку</h4>
        <CapacitySelectFilter
          onCapacityChange={handleCapacityChange}
          categoryId={1001}
        />
      </div>
      <Separator />

      {/* USB Cable Filters - always visible */}
      <div className="space-y-3">
        <h4 className="font-medium">Фільтри кабелів</h4>
        <USBCableFilters
          onFiltersChange={handleUSBFiltersChange}
          categoryId={1002}
        />
      </div>
      <Separator />

      {/* Stock Filter */}
      <div className="space-y-3">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={localFilters.inStockOnly || false}
            onChange={handleStockToggle}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-medium">Тільки в наявності</span>
        </label>
      </div>
    </div>
  );

  if (isMobile) {
    return <FilterContent />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Фільтри</span>
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
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
  );
}
