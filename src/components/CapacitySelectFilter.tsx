"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
    if (!categoryId || categoryId !== 1001) return;

    const loadCapacities = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/products?categoryId=${categoryId}`);
        const data = await response.json();

        if (data.success && data.products) {
          const capacities = new Set<number>();

          data.products.forEach((product: any) => {
            if (product.capacity && product.capacity > 0) {
              capacities.add(product.capacity);
            }
          });

          const sortedCapacities = Array.from(capacities).sort((a, b) => a - b);
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
      setSelectedCapacity(value);
      const capacity = value === "all" ? null : parseInt(value);
      onCapacityChange(capacity);
    },
    [onCapacityChange]
  );

  const clearFilter = () => {
    setSelectedCapacity("");
    onCapacityChange(null);
  };

  if (categoryId !== 1001) {
    return null;
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
          <Select value={selectedCapacity} onValueChange={handleCapacitySelect}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Оберіть ємність" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Всі ємності</SelectItem>
              {availableCapacities.map((capacity) => (
                <SelectItem key={capacity} value={capacity.toString()}>
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
