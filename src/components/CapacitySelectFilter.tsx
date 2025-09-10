"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";

interface CapacitySelectFilterProps {
  onCapacityChange: (capacity: number | null) => void;
  categoryId?: number;
}

export default function CapacitySelectFilter({
  onCapacityChange,
  categoryId,
}: CapacitySelectFilterProps) {
  const [selectedCapacity, setSelectedCapacity] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [availableCapacities, setAvailableCapacities] = useState<number[]>([]);

  // Load available capacities when categoryId changes
  useEffect(() => {
    console.log("CapacitySelectFilter useEffect:", { categoryId });
    if (!categoryId || categoryId !== 1001) {
      console.log("CapacitySelectFilter: Not a power bank category, returning");
      return;
    }

    const loadCapacities = async () => {
      console.log("Loading capacities for categoryId:", categoryId);
      setLoading(true);
      try {
        const response = await fetch(`/api/products?categoryId=${categoryId}`);
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
        }
      } catch (error) {
        console.error("Error loading capacities:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCapacities();
  }, [categoryId]);

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

  // Always show capacity filter, but only load data for power banks
  if (categoryId !== 1001) {
    return (
      <div className="space-y-4">
        <h4 className="font-medium">Ємність акумулятора</h4>
        <div className="text-sm text-muted-foreground">
          Оберіть категорію павербанків для фільтрації по ємності
        </div>
      </div>
    );
  }

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
            className="w-full p-2 border border-gray-300 rounded-md bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
}
