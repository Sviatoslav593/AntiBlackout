"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import PriceFilter from "@/components/PriceFilter";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Filter, X } from "lucide-react";

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
}

interface FiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  availableCategories: string[];
  availableBrands: string[];
  priceRange: { min: number; max: number };
  capacityRange: { min: number; max: number };
}

export default function Filters({
  filters,
  onFiltersChange,
  availableCategories,
  availableBrands,
  priceRange,
  capacityRange,
}: FiltersProps) {
  const [tempCapacityMin, setTempCapacityMin] = useState(
    filters.capacityRange.min.toString()
  );
  const [tempCapacityMax, setTempCapacityMax] = useState(
    filters.capacityRange.max.toString()
  );
  // Track if we're updating from external source vs user interaction
  const isUpdatingFromFilter = useRef(false);

  // Only update capacity when filters change from external source
  useEffect(() => {
    // Prevent infinite loops by checking if this is our own update
    if (!isUpdatingFromFilter.current) {
      setTempCapacityMin(filters.capacityRange.min.toString());
      setTempCapacityMax(filters.capacityRange.max.toString());
    }
    isUpdatingFromFilter.current = false;
  }, [filters.capacityRange.min, filters.capacityRange.max]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (capacityTimerRef.current) {
        clearTimeout(capacityTimerRef.current);
      }
    };
  }, []);

  // Use refs for timers to avoid state updates interfering with user interaction
  const capacityTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Handle price filter changes
  const handlePriceChange = (priceRange: { min: number; max: number }) => {
    onFiltersChange({
      ...filters,
      priceRange,
    });
  };

  // Handle capacity input changes with debounce
  const handleCapacityInputChange = (field: "min" | "max", value: string) => {
    if (field === "min") {
      setTempCapacityMin(value);
    } else {
      setTempCapacityMax(value);
    }

    // Clear existing timer
    if (capacityTimerRef.current) {
      clearTimeout(capacityTimerRef.current);
    }

    // Set new timer
    capacityTimerRef.current = setTimeout(() => {
      const currentMin = field === "min" ? value : tempCapacityMin;
      const currentMax = field === "max" ? value : tempCapacityMax;

      const min = Math.max(
        capacityRange.min,
        parseInt(currentMin) || capacityRange.min
      );
      const max = Math.min(
        capacityRange.max,
        parseInt(currentMax) || capacityRange.max
      );

      if (
        min !== filters.capacityRange.min ||
        max !== filters.capacityRange.max
      ) {
        onFiltersChange({
          ...filters,
          capacityRange: { min, max },
        });
      }
    }, 1000);
  };

  const handleCapacityInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      // Clear any pending debounce
      if (capacityTimerRef.current) {
        clearTimeout(capacityTimerRef.current);
        capacityTimerRef.current = null;
      }

      const min = Math.max(
        capacityRange.min,
        parseInt(tempCapacityMin) || capacityRange.min
      );
      const max = Math.min(
        capacityRange.max,
        parseInt(tempCapacityMax) || capacityRange.max
      );

      onFiltersChange({
        ...filters,
        capacityRange: { min, max },
      });
    }
  };

  const handleCategoryToggle = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category];

    onFiltersChange({
      ...filters,
      categories: newCategories,
    });
  };

  const handleBrandToggle = (brand: string) => {
    const newBrands = filters.brands.includes(brand)
      ? filters.brands.filter((b) => b !== brand)
      : [...filters.brands, brand];

    onFiltersChange({
      ...filters,
      brands: newBrands,
    });
  };

  const handleInStockToggle = () => {
    onFiltersChange({
      ...filters,
      inStockOnly: !filters.inStockOnly,
    });
  };

  const clearAllFilters = () => {
    // Clear any pending timers
    if (capacityTimerRef.current) {
      clearTimeout(capacityTimerRef.current);
      capacityTimerRef.current = null;
    }

    const clearedFilters = {
      priceRange: { min: priceRange.min, max: priceRange.max },
      categories: [],
      brands: [],
      capacityRange: { min: capacityRange.min, max: capacityRange.max },
      inStockOnly: false,
    };

    // Update local state first
    setTempCapacityMin(capacityRange.min.toString());
    setTempCapacityMax(capacityRange.max.toString());

    // Then update filters
    onFiltersChange(clearedFilters);
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
                onChange={() => handleCategoryToggle(category)}
                className="rounded border-gray-300"
              />
              <span className="text-sm capitalize">
                {category === "powerbank"
                  ? "Павербанки"
                  : category === "charger"
                  ? "Зарядки"
                  : category === "cable"
                  ? "Кабелі"
                  : category}
              </span>
            </label>
          ))}
        </div>
      </div>

      <Separator />

      {/* Brands */}
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
                checked={filters.brands.includes(brand)}
                onChange={() => handleBrandToggle(brand)}
                className="rounded border-gray-300"
              />
              <span className="text-sm">{brand}</span>
            </label>
          ))}
        </div>
      </div>

      <Separator />

      {/* Capacity Range (for powerbanks) */}
      <div className="space-y-3">
        <h4 className="font-medium">Ємність (мАг)</h4>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Від"
            value={tempCapacityMin}
            onChange={(e) => handleCapacityInputChange("min", e.target.value)}
            onKeyDown={handleCapacityInputKeyDown}
            className="text-sm"
            min={capacityRange.min}
            max={capacityRange.max}
          />
          <Input
            type="number"
            placeholder="До"
            value={tempCapacityMax}
            onChange={(e) => handleCapacityInputChange("max", e.target.value)}
            onKeyDown={handleCapacityInputKeyDown}
            className="text-sm"
            min={capacityRange.min}
            max={capacityRange.max}
          />
        </div>
        <div className="text-xs text-muted-foreground">
          Для павербанків ({capacityRange.min} - {capacityRange.max} мАг)
        </div>
      </div>

      <Separator />

      {/* In Stock Only */}
      <div className="space-y-3">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={handleInStockToggle}
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
