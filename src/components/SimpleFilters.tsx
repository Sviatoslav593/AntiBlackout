"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { FilterState } from "@/context/FilterContext";
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
  priceRange: { min: number; max: number };
  capacityRange: { min: number; max: number };
  onApplyFilters?: (filterParams: {
    categoryIds?: string[];
    brandIds?: string[];
    search?: string;
    inStockOnly?: boolean;
    minPrice?: number;
    maxPrice?: number;
    inputConnector?: string;
    outputConnector?: string;
    cableLength?: string;
  }) => Promise<void>;
  selectedCategoryId?: number;
}

export default function SimpleFilters({
  filters: propFilters,
  onFiltersChange,
  availableCategories,
  availableBrands,
  priceRange,
  capacityRange,
  onApplyFilters,
  selectedCategoryId,
}: SimpleFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<FilterState>(propFilters);

  const handleCategoryToggle = (category: string) => {
    const newCategories = localFilters.categories.includes(category)
      ? localFilters.categories.filter((c) => c !== category)
      : [...localFilters.categories, category];
    
    const newFilters = { ...localFilters, categories: newCategories };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleBrandToggle = (brand: string) => {
    const newBrands = localFilters.brands.includes(brand)
      ? localFilters.brands.filter((b) => b !== brand)
      : [...localFilters.brands, brand];
    
    const newFilters = { ...localFilters, brands: newBrands };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleInStockToggle = () => {
    const newFilters = { ...localFilters, inStockOnly: !localFilters.inStockOnly };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      priceRange: { min: 0, max: 10000 },
      inStockOnly: false,
      categories: [],
      brands: [],
      capacityRange: { min: 0, max: 50000 },
      usbFilters: {},
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = 
    localFilters.categories.length > 0 ||
    localFilters.brands.length > 0 ||
    localFilters.inStockOnly ||
    localFilters.priceRange.min > 0 ||
    localFilters.priceRange.max < 10000 ||
    localFilters.capacityRange.min > 0 ||
    localFilters.capacityRange.max < 50000;

  return (
    <div className="space-y-4">
      {/* Mobile Filter Button */}
      <div className="lg:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full">
              <Filter className="w-4 h-4 mr-2" />
              Фільтри
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2">
                  {localFilters.categories.length + localFilters.brands.length}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80">
            <SheetHeader>
              <SheetTitle>Фільтри</SheetTitle>
            </SheetHeader>
            <div className="mt-6 space-y-6">
              {renderFilterContent()}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Filters */}
      <div className="hidden lg:block">
        {renderFilterContent()}
      </div>
    </div>
  );

  function renderFilterContent() {
    return (
      <>
        {/* Categories */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Категорії</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {availableCategories.map((category) => (
              <div
                key={category}
                className="flex items-center space-x-2 cursor-pointer"
                onClick={() => handleCategoryToggle(category)}
              >
                <input
                  type="checkbox"
                  checked={localFilters.categories.includes(category)}
                  onChange={() => handleCategoryToggle(category)}
                  className="rounded"
                />
                <span className="text-sm">{category}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Brands */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Бренди</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-48 overflow-y-auto">
            {availableBrands.map((brand) => (
              <div
                key={brand}
                className="flex items-center space-x-2 cursor-pointer"
                onClick={() => handleBrandToggle(brand)}
              >
                <input
                  type="checkbox"
                  checked={localFilters.brands.includes(brand)}
                  onChange={() => handleBrandToggle(brand)}
                  className="rounded"
                />
                <span className="text-sm">{brand}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* In Stock Only */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Наявність</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="flex items-center space-x-2 cursor-pointer"
              onClick={handleInStockToggle}
            >
              <input
                type="checkbox"
                checked={localFilters.inStockOnly}
                onChange={handleInStockToggle}
                className="rounded"
              />
              <span className="text-sm">Тільки в наявності</span>
            </div>
          </CardContent>
        </Card>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={clearFilters}
            className="w-full"
          >
            Очистити фільтри
          </Button>
        )}
      </>
    );
  }
}
