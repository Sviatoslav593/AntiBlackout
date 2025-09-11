"use client";

import { useCallback, useMemo, useState, useEffect, memo } from "react";
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

const FiltersSPA = memo(function FiltersSPA({
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

  // Update local filters when URL filters change (but don't reset if we're in the middle of selecting)
  useEffect(() => {
    console.log("FiltersSPA: activeFilters changed:", activeFilters);
    // Always sync localFilters with activeFilters to ensure checkboxes work
    setLocalFilters(activeFilters);
  }, [activeFilters]); // Fixed: removed localFilters from dependencies to prevent infinite loop

  // Category name to ID mapping
  const categoryNameToIdMap: Record<string, string> = {
    "Портативні батареї": "1001",
    "Зарядки та кабелі": "1002",
    "Акумулятори та powerbank": "1",
    "Мережеві зарядні пристрої": "15",
    "Кабелі usb": "16",
    "Бездротові зарядні пристрої": "80",
  };

  // Handle category toggle
  const handleCategoryToggle = useCallback(
    (category: string) => {
      console.log("Category toggle clicked:", category);
      console.log("Current localFilters:", localFilters);

      // Convert category name to ID
      const categoryId = categoryNameToIdMap[category] || category;
      console.log("Category ID:", categoryId);

      const newCategories = localFilters.categoryIds || [];
      const updatedCategories = newCategories.includes(categoryId)
        ? newCategories.filter((c) => c !== categoryId)
        : [...newCategories, categoryId];

      const newFilters = {
        ...localFilters,
        categoryIds: updatedCategories,
      };

      console.log("New category filters:", newFilters);
      setLocalFilters(newFilters);
      // Don't apply filters immediately - wait for apply button
    },
    [localFilters]
  );

  // Handle brand toggle
  const handleBrandToggle = useCallback(
    (brand: string) => {
      console.log("Brand toggle clicked:", brand);
      console.log("Current localFilters:", localFilters);
      const newBrands = localFilters.brandIds || [];
      const updatedBrands = newBrands.includes(brand)
        ? newBrands.filter((b) => b !== brand)
        : [...newBrands, brand];

      const newFilters = {
        ...localFilters,
        brandIds: updatedBrands,
      };

      console.log("New brand filters:", newFilters);
      setLocalFilters(newFilters);
      // Don't apply filters immediately - wait for apply button
    },
    [localFilters]
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
    (capacity: number | null) => {
      let newFilters = { ...localFilters };

      if (capacity === null) {
        newFilters = {
          ...newFilters,
          minCapacity: undefined,
          maxCapacity: undefined,
        };
      } else {
        newFilters = {
          ...newFilters,
          minCapacity: capacity,
          maxCapacity: capacity,
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
          <h4 className="font-medium text-gray-900">Категорії</h4>
          <div className="space-y-2">
            {availableCategories.map((category) => (
              <label
                key={category}
                className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors"
              >
                <input
                  type="checkbox"
                  checked={(localFilters.categoryIds || []).includes(
                    categoryNameToIdMap[category] || category
                  )}
                  onChange={() => {
                    console.log(
                      "Category checkbox clicked:",
                      category,
                      "Current state:",
                      localFilters.categoryIds
                    );
                    handleCategoryToggle(category);
                  }}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-sm text-gray-700">{category}</span>
              </label>
            ))}
          </div>
          <Separator />
        </div>
      )}

      {/* Brands */}
      {availableBrands && availableBrands.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Бренди</h4>
          <div className="space-y-2">
            {availableBrands.map((brand) => (
              <label
                key={brand}
                className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors"
              >
                <input
                  type="checkbox"
                  checked={(localFilters.brandIds || []).includes(brand)}
                  onChange={() => {
                    console.log(
                      "Brand checkbox clicked:",
                      brand,
                      "Current state:",
                      localFilters.brandIds
                    );
                    handleBrandToggle(brand);
                  }}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-sm text-gray-700">{brand}</span>
              </label>
            ))}
          </div>
          <Separator />
        </div>
      )}

      {/* Price Filter */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Ціна</h4>
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
        <h4 className="font-medium text-gray-900">Ємність павербанку</h4>
        <CapacitySelectFilter
          onCapacityChange={handleCapacityChange}
          categoryId={1001}
        />
      </div>
      <Separator />

      {/* USB Cable Filters - always visible */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Фільтри кабелів</h4>
        <USBCableFilters
          onFiltersChange={handleUSBFiltersChange}
          categoryId={1002}
        />
      </div>
      <Separator />

      {/* Stock Filter */}
      <div className="space-y-3">
        <label className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors">
          <input
            type="checkbox"
            checked={localFilters.inStockOnly || false}
            onChange={handleStockToggle}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
          />
          <span className="text-sm font-medium text-gray-700">
            Тільки в наявності
          </span>
        </label>
      </div>

      {/* Apply Filters Button */}
      <div className="pt-4 border-t">
        <Button
          onClick={() => {
            console.log("Applying filters:", localFilters);
            applyFiltersAndUpdateUrl(localFilters);
          }}
          className="w-full"
          size="lg"
        >
          Застосувати фільтри
        </Button>
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
});

export default FiltersSPA;
