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

interface SimpleFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  availableCategories: string[];
  availableBrands: string[];
  selectedCategoryId?: number;
}

export default function SimpleFilters({
  filters,
  onFiltersChange,
  availableCategories,
  availableBrands,
  selectedCategoryId,
}: SimpleFiltersProps) {
  // Use FilterContext when available, fallback to props
  const { filters: contextFilters, setFilters } = useFilters();
  const actualFilters = contextFilters ||
    filters || {
      priceRange: { min: 0, max: 10000 },
      inStockOnly: false,
      categories: [],
      brands: [],
      capacityRange: { min: 0, max: 50000 },
      usbFilters: {},
    };

  // Stable callback for filters to prevent re-renders
  const handleFiltersChange = useCallback(
    (newFilters: FilterState) => {
      if (setFilters) {
        setFilters(newFilters);
      } else {
        onFiltersChange(newFilters);
      }
    },
    [setFilters, onFiltersChange]
  );

  // Memoize selectedCategoryId to prevent unnecessary re-renders
  const memoizedSelectedCategoryId = useMemo(
    () => selectedCategoryId,
    [selectedCategoryId]
  );

  const handleCategoryChange = (category: string, checked: boolean) => {
    const newCategories = checked
      ? [...actualFilters.categories, category]
      : actualFilters.categories.filter((c) => c !== category);

    handleFiltersChange({
      ...actualFilters,
      categories: newCategories,
    });
  };

  const handleBrandChange = (brand: string, checked: boolean) => {
    const newBrands = checked
      ? [...actualFilters.brands, brand]
      : actualFilters.brands.filter((b) => b !== brand);

    handleFiltersChange({
      ...actualFilters,
      brands: newBrands,
    });
  };

  const handleInStockChange = (inStock: boolean) => {
    handleFiltersChange({
      ...actualFilters,
      inStockOnly: inStock,
    });
  };

  const handlePriceRangeChange = (priceRange: { min: number; max: number }) => {
    handleFiltersChange({
      ...actualFilters,
      priceRange,
    });
  };

  const handleCapacityRangeChange = (capacityRange: {
    min: number;
    max: number;
  }) => {
    handleFiltersChange({
      ...actualFilters,
      capacityRange,
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
    actualFilters.categories.length > 0 ||
    actualFilters.brands.length > 0 ||
    actualFilters.inStockOnly ||
    actualFilters.priceRange.min > 0 ||
    actualFilters.priceRange.max < 10000 ||
    actualFilters.capacityRange.min > 0 ||
    actualFilters.capacityRange.max < 50000;

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
          <CardContent className="space-y-6">
            {/* Categories */}
            {availableCategories.length > 0 && (
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
                        checked={actualFilters.categories.includes(category)}
                        onChange={(e) =>
                          handleCategoryChange(category, e.target.checked)
                        }
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
            {availableBrands.length > 0 && (
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
                        checked={actualFilters.brands.includes(brand)}
                        onChange={(e) =>
                          handleBrandChange(brand, e.target.checked)
                        }
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm">{brand}</span>
                    </label>
                  ))}
                </div>
                <Separator />
              </div>
            )}

            {/* In Stock Only */}
            <div className="space-y-3">
              <h4 className="font-medium">Наявність</h4>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={actualFilters.inStockOnly}
                  onChange={(e) => handleInStockChange(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">Тільки в наявності</span>
              </label>
              <Separator />
            </div>

            {/* Price Range */}
            <div className="space-y-3">
              <h4 className="font-medium">Ціна</h4>
              <PriceFilter
                priceRange={actualFilters.priceRange}
                onPriceRangeChange={handlePriceRangeChange}
              />
              <Separator />
            </div>

            {/* Capacity Range - only for power banks */}
            {memoizedSelectedCategoryId === 1001 && (
              <div className="space-y-3">
                <h4 className="font-medium">Ємність (мАг)</h4>
                <CapacityFilter
                  capacityRange={actualFilters.capacityRange}
                  onCapacityRangeChange={handleCapacityRangeChange}
                />
                <Separator />
              </div>
            )}
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
                  {actualFilters.categories.length +
                    actualFilters.brands.length +
                    (actualFilters.inStockOnly ? 1 : 0) +
                    (actualFilters.priceRange.min > 0 ? 1 : 0) +
                    (actualFilters.priceRange.max < 10000 ? 1 : 0) +
                    (actualFilters.capacityRange.min > 0 ? 1 : 0) +
                    (actualFilters.capacityRange.max < 50000 ? 1 : 0)}
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
            <div className="mt-6 space-y-6">
              {/* Categories */}
              {availableCategories.length > 0 && (
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
                          checked={actualFilters.categories.includes(category)}
                          onChange={(e) =>
                            handleCategoryChange(category, e.target.checked)
                          }
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
              {availableBrands.length > 0 && (
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
                          checked={actualFilters.brands.includes(brand)}
                          onChange={(e) =>
                            handleBrandChange(brand, e.target.checked)
                          }
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm">{brand}</span>
                      </label>
                    ))}
                  </div>
                  <Separator />
                </div>
              )}

              {/* In Stock Only */}
              <div className="space-y-3">
                <h4 className="font-medium">Наявність</h4>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={actualFilters.inStockOnly}
                    onChange={(e) => handleInStockChange(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">Тільки в наявності</span>
                </label>
                <Separator />
              </div>

              {/* Price Range */}
              <div className="space-y-3">
                <h4 className="font-medium">Ціна</h4>
                <PriceFilter
                  priceRange={actualFilters.priceRange}
                  onPriceRangeChange={handlePriceRangeChange}
                />
                <Separator />
              </div>

              {/* Capacity Range - only for power banks */}
              {memoizedSelectedCategoryId === 1001 && (
                <div className="space-y-3">
                  <h4 className="font-medium">Ємність (мАг)</h4>
                  <CapacityFilter
                    capacityRange={actualFilters.capacityRange}
                    onCapacityRangeChange={handleCapacityRangeChange}
                  />
                  <Separator />
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
