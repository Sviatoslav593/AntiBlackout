"use client";

import { useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import PriceFilter from "@/components/PriceFilter";
import CapacityFilter from "@/components/CapacityFilter";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Filter } from "lucide-react";

interface BasicFiltersProps {
  filters: {
    priceRange: { min: number; max: number };
    inStockOnly: boolean;
    categories: string[];
    brands: string[];
    capacityRange: { min: number; max: number };
    usbFilters: {
      inputConnector?: string;
      outputConnector?: string;
      cableLength?: string;
    };
  };
  onFiltersChange: (filters: any) => void;
  availableCategories: string[];
  availableBrands: string[];
  selectedCategoryId?: number;
}

export default function BasicFilters({
  filters,
  onFiltersChange,
  availableCategories,
  availableBrands,
  selectedCategoryId,
}: BasicFiltersProps) {
  const handleCategoryChange = (category: string, checked: boolean) => {
    const newCategories = checked
      ? [...filters.categories, category]
      : filters.categories.filter((c) => c !== category);

    onFiltersChange({
      ...filters,
      categories: newCategories,
    });
  };

  const handleBrandChange = (brand: string, checked: boolean) => {
    const newBrands = checked
      ? [...filters.brands, brand]
      : filters.brands.filter((b) => b !== brand);

    onFiltersChange({
      ...filters,
      brands: newBrands,
    });
  };

  const handleInStockChange = (inStock: boolean) => {
    onFiltersChange({
      ...filters,
      inStockOnly: inStock,
    });
  };

  const handlePriceRangeChange = (priceRange: { min: number; max: number }) => {
    onFiltersChange({
      ...filters,
      priceRange,
    });
  };

  const handleCapacityRangeChange = (capacityRange: {
    min: number;
    max: number;
  }) => {
    onFiltersChange({
      ...filters,
      capacityRange,
    });
  };

  const clearFilters = () => {
    onFiltersChange({
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
                        checked={filters.categories.includes(category)}
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
                        checked={filters.brands.includes(brand)}
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
                  checked={filters.inStockOnly}
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
                priceRange={filters.priceRange}
                onPriceRangeChange={handlePriceRangeChange}
              />
              <Separator />
            </div>

            {/* Capacity Range - only for power banks */}
            {selectedCategoryId === 1001 && (
              <div className="space-y-3">
                <h4 className="font-medium">Ємність (мАг)</h4>
                <CapacityFilter
                  capacityRange={filters.capacityRange}
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
                          checked={filters.categories.includes(category)}
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
                          checked={filters.brands.includes(brand)}
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
                    checked={filters.inStockOnly}
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
                  priceRange={filters.priceRange}
                  onPriceRangeChange={handlePriceRangeChange}
                />
                <Separator />
              </div>

              {/* Capacity Range - only for power banks */}
              {selectedCategoryId === 1001 && (
                <div className="space-y-3">
                  <h4 className="font-medium">Ємність (мАг)</h4>
                  <CapacityFilter
                    capacityRange={filters.capacityRange}
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
