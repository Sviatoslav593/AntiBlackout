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

// Static capacity options for power banks
const STATIC_CAPACITIES = [5000, 10000, 20000, 30000, 40000, 50000, 60000];

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

  // Update selectedCapacity when value prop changes
  useEffect(() => {
    setSelectedCapacity(value?.toString() || "all");
  }, [value]);

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
      <div className="space-y-2">
        <Select value={selectedCapacity} onValueChange={handleCapacitySelect}>
          <SelectTrigger className="w-full cursor-pointer">
            <SelectValue placeholder="Оберіть ємність" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="cursor-pointer">
              Всі ємності
            </SelectItem>
            {STATIC_CAPACITIES.map((capacity) => (
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
    </div>
  );
});

export default CapacitySelectFilter;
