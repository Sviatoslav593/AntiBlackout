"use client";

import { useState, useEffect, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";

interface CapacitySelectFilterProps {
  onCapacityChange: (capacity: number | null) => void;
  categoryId?: number;
}

const CapacitySelectFilter = memo(function CapacitySelectFilter({
  onCapacityChange,
  categoryId,
}: CapacitySelectFilterProps) {
  const [selectedCapacity, setSelectedCapacity] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [filtersLoaded, setFiltersLoaded] = useState(false);
  const [availableCapacities, setAvailableCapacities] = useState<number[]>([]);

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

  // Handle capacity selection
  const handleCapacitySelect = useCallback(
    (value: string) => {
      console.log(
        "CapacitySelectFilter: handleCapacitySelect called with:",
        value
      );
      setSelectedCapacity(value);
      const capacity = value === "all" || value === "" ? null : parseInt(value);
      console.log(
        "CapacitySelectFilter: calling onCapacityChange with:",
        capacity
      );
      onCapacityChange(capacity);
    },
    [onCapacityChange]
  );

  const clearFilter = () => {
    setSelectedCapacity("");
    onCapacityChange(null);
  };

  // Always show capacity filter with data

  return (
    <div className="space-y-4">
      <h4 className="font-medium">Ємність акумулятора</h4>
      {loading ? (
        <div className="text-sm text-muted-foreground">
          Завантаження опцій...
        </div>
      ) : (
        <div className="space-y-3">
          <select
            value={selectedCapacity}
            onChange={(e) => handleCapacitySelect(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm hover:border-gray-400 transition-colors duration-200 appearance-none cursor-pointer"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: 'right 0.5rem center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '1.5em 1.5em',
              paddingRight: '2.5rem'
            }}
          >
            <option value="">Оберіть ємність</option>
            <option value="all">Всі ємності</option>
            {availableCapacities.map((capacity) => (
              <option key={capacity} value={capacity.toString()}>
                {capacity} мАг
              </option>
            ))}
          </select>

          {selectedCapacity && selectedCapacity !== "all" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilter}
              className="cursor-pointer w-full"
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
