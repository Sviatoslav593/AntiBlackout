'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Filter, X } from 'lucide-react'

export interface FilterState {
  priceRange: {
    min: number
    max: number
  }
  categories: string[]
  brands: string[]
  capacityRange: {
    min: number
    max: number
  }
  inStockOnly: boolean
}

interface FiltersProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  availableCategories: string[]
  availableBrands: string[]
  priceRange: { min: number; max: number }
  capacityRange: { min: number; max: number }
}

export default function Filters({
  filters,
  onFiltersChange,
  availableCategories,
  availableBrands,
  priceRange,
  capacityRange
}: FiltersProps) {
  const [tempPriceMin, setTempPriceMin] = useState(filters.priceRange.min.toString())
  const [tempPriceMax, setTempPriceMax] = useState(filters.priceRange.max.toString())
  const [tempCapacityMin, setTempCapacityMin] = useState(filters.capacityRange.min.toString())
  const [tempCapacityMax, setTempCapacityMax] = useState(filters.capacityRange.max.toString())

  const handlePriceRangeChange = () => {
    const min = Math.max(0, parseInt(tempPriceMin) || 0)
    const max = parseInt(tempPriceMax) || priceRange.max
    
    onFiltersChange({
      ...filters,
      priceRange: { min, max }
    })
  }

  const handleCapacityRangeChange = () => {
    const min = Math.max(0, parseInt(tempCapacityMin) || 0)
    const max = parseInt(tempCapacityMax) || capacityRange.max
    
    onFiltersChange({
      ...filters,
      capacityRange: { min, max }
    })
  }

  const handleCategoryToggle = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category]
    
    onFiltersChange({
      ...filters,
      categories: newCategories
    })
  }

  const handleBrandToggle = (brand: string) => {
    const newBrands = filters.brands.includes(brand)
      ? filters.brands.filter(b => b !== brand)
      : [...filters.brands, brand]
    
    onFiltersChange({
      ...filters,
      brands: newBrands
    })
  }

  const handleInStockToggle = () => {
    onFiltersChange({
      ...filters,
      inStockOnly: !filters.inStockOnly
    })
  }

  const clearAllFilters = () => {
    const clearedFilters = {
      priceRange: { min: priceRange.min, max: priceRange.max },
      categories: [],
      brands: [],
      capacityRange: { min: capacityRange.min, max: capacityRange.max },
      inStockOnly: false
    }
    
    onFiltersChange(clearedFilters)
    setTempPriceMin(priceRange.min.toString())
    setTempPriceMax(priceRange.max.toString())
    setTempCapacityMin(capacityRange.min.toString())
    setTempCapacityMax(capacityRange.max.toString())
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.priceRange.min > priceRange.min || filters.priceRange.max < priceRange.max) count++
    if (filters.categories.length > 0) count++
    if (filters.brands.length > 0) count++
    if (filters.capacityRange.min > capacityRange.min || filters.capacityRange.max < capacityRange.max) count++
    if (filters.inStockOnly) count++
    return count
  }

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Active Filters Count */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Фільтри</h3>
        <div className="flex items-center gap-2">
          {getActiveFiltersCount() > 0 && (
            <Badge variant="secondary">
              {getActiveFiltersCount()}
            </Badge>
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
      <div className="space-y-3">
        <h4 className="font-medium">Ціна (₴)</h4>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Від"
            value={tempPriceMin}
            onChange={(e) => setTempPriceMin(e.target.value)}
            onBlur={handlePriceRangeChange}
            onKeyDown={(e) => e.key === 'Enter' && handlePriceRangeChange()}
            className="text-sm"
          />
          <Input
            type="number"
            placeholder="До"
            value={tempPriceMax}
            onChange={(e) => setTempPriceMax(e.target.value)}
            onBlur={handlePriceRangeChange}
            onKeyDown={(e) => e.key === 'Enter' && handlePriceRangeChange()}
            className="text-sm"
          />
        </div>
        <div className="text-xs text-muted-foreground">
          Діапазон: {priceRange.min} - {priceRange.max} ₴
        </div>
      </div>

      <Separator />

      {/* Categories */}
      <div className="space-y-3">
        <h4 className="font-medium">Категорії</h4>
        <div className="space-y-2">
          {availableCategories.map((category) => (
            <label key={category} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.categories.includes(category)}
                onChange={() => handleCategoryToggle(category)}
                className="rounded border-gray-300"
              />
              <span className="text-sm capitalize">
                {category === 'powerbank' ? 'Павербанки' :
                 category === 'charger' ? 'Зарядки' :
                 category === 'cable' ? 'Кабелі' : category}
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
            <label key={brand} className="flex items-center space-x-2 cursor-pointer">
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
            onBlur={handleCapacityRangeChange}
            onKeyDown={(e) => e.key === 'Enter' && handleCapacityRangeChange()}
            className="text-sm"
          />
          <Input
            type="number"
            placeholder="До"
            value={tempCapacityMax}
            onChange={(e) => setTempCapacityMax(e.target.value)}
            onBlur={handleCapacityRangeChange}
            onKeyDown={(e) => e.key === 'Enter' && handleCapacityRangeChange()}
            className="text-sm"
          />
        </div>
        <div className="text-xs text-muted-foreground">
          Для павербанків
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
  )

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
          <SheetContent side="left" className="w-80">
            <SheetHeader>
              <SheetTitle>Фільтри товарів</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
