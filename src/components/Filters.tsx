"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
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
  const [tempPriceMin, setTempPriceMin] = useState(
    filters.priceRange.min.toString()
  );
  const [tempPriceMax, setTempPriceMax] = useState(
    filters.priceRange.max.toString()
  );
  const [tempCapacityMin, setTempCapacityMin] = useState(
    filters.capacityRange.min.toString()
  );
  const [tempCapacityMax, setTempCapacityMax] = useState(
    filters.capacityRange.max.toString()
  );
  const [sliderPriceRange, setSliderPriceRange] = useState([
    filters.priceRange.min,
    filters.priceRange.max,
  ]);

  // Update temp values when filters change externally
  useEffect(() => {
    setTempPriceMin(filters.priceRange.min.toString());
    setTempPriceMax(filters.priceRange.max.toString());
    setSliderPriceRange([filters.priceRange.min, filters.priceRange.max]);
  }, [filters.priceRange]);

  // Debounce effect for price input changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const min = Math.max(priceRange.min, parseInt(tempPriceMin) || priceRange.min);
      const max = Math.min(priceRange.max, parseInt(tempPriceMax) || priceRange.max);
      
      if (min !== filters.priceRange.min || max !== filters.priceRange.max) {
        onFiltersChange({
          ...filters,
          priceRange: { min, max },
        });
      }
    }, 800); // 800ms debounce

    return () => clearTimeout(timeoutId);
  }, [tempPriceMin, tempPriceMax]);

  // Debounce effect for capacity input changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const min = Math.max(capacityRange.min, parseInt(tempCapacityMin) || capacityRange.min);
      const max = Math.min(capacityRange.max, parseInt(tempCapacityMax) || capacityRange.max);
      
      if (min !== filters.capacityRange.min || max !== filters.capacityRange.max) {
        onFiltersChange({
          ...filters,
          capacityRange: { min, max },
        });
      }
    }, 800); // 800ms debounce

    return () => clearTimeout(timeoutId);
  }, [tempCapacityMin, tempCapacityMax]);

  const handleSliderPriceChange = (values: number[]) => {
    const [min, max] = values;
    setSliderPriceRange([min, max]);
    setTempPriceMin(min.toString());
    setTempPriceMax(max.toString());
    
    onFiltersChange({
      ...filters,
      priceRange: { min, max },
    });
  };

  const handlePriceInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const min = Math.max(0, parseInt(tempPriceMin) || priceRange.min);
      const max = Math.min(priceRange.max, parseInt(tempPriceMax) || priceRange.max);
      
      onFiltersChange({
        ...filters,
        priceRange: { min, max },
      });
      setSliderPriceRange([min, max]);
    }
  };

  const handleCapacityInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const min = Math.max(0, parseInt(tempCapacityMin) || capacityRange.min);
      const max = Math.min(capacityRange.max, parseInt(tempCapacityMax) || capacityRange.max);
      
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
    const clearedFilters = {
      priceRange: { min: priceRange.min, max: priceRange.max },
      categories: [],
      brands: [],
      capacityRange: { min: capacityRange.min, max: capacityRange.max },
      inStockOnly: false,
    };

    onFiltersChange(clearedFilters);
    setTempPriceMin(priceRange.min.toString());
    setTempPriceMax(priceRange.max.toString());
    setTempCapacityMin(capacityRange.min.toString());
    setTempCapacityMax(capacityRange.max.toString());
    setSliderPriceRange([priceRange.min, priceRange.max]);
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
      <div className="space-y-4">
        <h4 className="font-medium">Ціна (₴)</h4>
        
        {/* Price Slider */}
        <div className="space-y-3">
          <Slider
            value={sliderPriceRange}
            onValueChange={handleSliderPriceChange}
            max={priceRange.max}
            min={priceRange.min}
            step={50}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{sliderPriceRange[0]} ₴</span>
            <span>{sliderPriceRange[1]} ₴</span>
          </div>
        </div>

        {/* Price Inputs */}
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Від"
            value={tempPriceMin}
            onChange={(e) => setTempPriceMin(e.target.value)}
            onKeyDown={handlePriceInputKeyDown}
            className="text-sm"
            min={priceRange.min}
            max={priceRange.max}
          />
          <Input
            type="number"
            placeholder="До"
            value={tempPriceMax}
            onChange={(e) => setTempPriceMax(e.target.value)}
            onKeyDown={handlePriceInputKeyDown}
            className="text-sm"
            min={priceRange.min}
            max={priceRange.max}
          />
        </div>
        
        <div className="text-xs text-muted-foreground">
          Повний діапазон: {priceRange.min} - {priceRange.max} ₴
        </div>
      </div>

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
            onChange={(e) => setTempCapacityMin(e.target.value)}
            onKeyDown={handleCapacityInputKeyDown}
            className="text-sm"
            min={capacityRange.min}
            max={capacityRange.max}
          />
          <Input
            type="number"
            placeholder="До"
            value={tempCapacityMax}
            onChange={(e) => setTempCapacityMax(e.target.value)}
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
            <SheetHeader className="sticky top-0 bg-background pb-4 border-b">
              <SheetTitle>Фільтри товарів</SheetTitle>
            </SheetHeader>
            <div className="mt-6 pb-6">
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
