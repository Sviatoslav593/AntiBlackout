"use client";

import { useState, useEffect, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CapacitySelectFilterProps {
  onCapacityChange: (capacity: number | null) => void;
  categoryId?: number;
  value?: number | null; // Add value prop for controlled component
  onGetCurrentValue?: () => number | null; // Callback to get current value
}

const CapacitySelectFilter = memo(function CapacitySelectFilter({
  onCapacityChange,
  categoryId,
  value,
  onGetCurrentValue,
}: CapacitySelectFilterProps) {
  const [selectedCapacity, setSelectedCapacity] = useState<string>(
    value?.toString() || "all"
  );
  const [loading, setLoading] = useState(false);
  const [filtersLoaded, setFiltersLoaded] = useState(false);
  const [availableCapacities, setAvailableCapacities] = useState<number[]>([]);

  // Update selectedCapacity when value prop changes
  useEffect(() => {
    setSelectedCapacity(value?.toString() || "all");
  }, [value]);

  // Load available capacities when component mounts
  useEffect(() => {
    console.log("CapacitySelectFilter useEffect:", {
      categoryId,
      filtersLoaded,
      availableCapacitiesLength: availableCapacities.length,
    });

    // Only load if we haven't loaded filters yet
    if (filtersLoaded) {
      console.log("Skipping capacity load - already loaded");
      return;
    }

    // Always load options, but use categoryId 1001 for power banks
    const effectiveCategoryId = 1001; // Always use 1001 for power banks

    const loadCapacities = async () => {
      console.log(
        "Loading capacities for effectiveCategoryId:",
        effectiveCategoryId
      );
      setLoading(true);
      try {
        const response = await fetch(
          `/api/products?categoryId=${effectiveCategoryId}`
        );
        const data = await response.json();
        console.log("Capacity API response:", data);

        if (data.success && data.products) {
          const capacities = new Set<number>();

          data.products.forEach((product: any) => {
            if (product.capacity && product.capacity > 0) {
              capacities.add(product.capacity);
            }
          });

          const sortedCapacities = Array.from(capacities).sort((a, b) => a - b);
          console.log("Available capacities:", sortedCapacities);
          setAvailableCapacities(sortedCapacities);
          setFiltersLoaded(true);
        }
      } catch (error) {
        console.error("Error loading capacities:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCapacities();
  }, [filtersLoaded]); // Fixed: only depend on filtersLoaded

  // Handle capacity selection - only update local state, don't call onCapacityChange immediately
  const handleCapacitySelect = useCallback((value: string) => {
    console.log(
      "CapacitySelectFilter: handleCapacitySelect called with:",
      value
    );
    setSelectedCapacity(value);
    // Don't call onCapacityChange immediately - wait for apply button
  }, []);

  const clearFilter = () => {
    setSelectedCapacity("all");
    // Don't call onCapacityChange immediately - wait for apply button
  };

  // Expose current value to parent component
  useEffect(() => {
    if (onGetCurrentValue) {
      const currentValue =
        selectedCapacity === "all" || selectedCapacity === ""
          ? null
          : parseInt(selectedCapacity);
      onGetCurrentValue = () => currentValue;
    }
  }, [selectedCapacity, onGetCurrentValue]);

  // Always show capacity filter with data

  return (
    <div className="space-y-3">
      <h4 className="font-medium text-gray-900">Ємність акумулятора</h4>
      {loading ? (
        <div className="text-sm text-muted-foreground">
          Завантаження опцій...
        </div>
      ) : (
        <div className="space-y-2">
          <Select value={selectedCapacity} onValueChange={handleCapacitySelect}>
            <SelectTrigger className="w-full cursor-pointer">
              <SelectValue placeholder="Оберіть ємність" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="cursor-pointer">
                Всі ємності
              </SelectItem>
              {availableCapacities.map((capacity) => (
                <SelectItem
                  key={capacity}
                  value={capacity.toString()}
                  className="cursor-pointer"
                >
                  {capacity} мАг
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedCapacity && selectedCapacity !== "all" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilter}
              className="cursor-pointer w-full text-sm"
            >
              Очистити фільтр ємності
            </Button>
          )}
        </div>
      )}
    </div>
  );
});

export default CapacitySelectFilter;
