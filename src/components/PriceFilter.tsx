"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

interface PriceRange {
  min: number;
  max: number;
}

interface PriceFilterProps {
  value: PriceRange;
  onChange: (value: PriceRange) => void;
  min: number;
  max: number;
  className?: string;
}

export default function PriceFilter({
  value,
  onChange,
  min,
  max,
  className = "",
}: PriceFilterProps) {
  // Local state for UI interactions (prevents re-renders from parent)
  const [localSliderValue, setLocalSliderValue] = useState<[number, number]>([
    value.min,
    value.max,
  ]);
  const [localMinInput, setLocalMinInput] = useState<string>(
    value.min.toString()
  );
  const [localMaxInput, setLocalMaxInput] = useState<string>(
    value.max.toString()
  );

  // Sync local state with external value changes (only when not actively interacting)
  const [isUserInteracting, setIsUserInteracting] = useState(false);

  useEffect(() => {
    if (!isUserInteracting) {
      setLocalSliderValue([value.min, value.max]);
      setLocalMinInput(value.min.toString());
      setLocalMaxInput(value.max.toString());
    }
  }, [value.min, value.max, isUserInteracting]);

  // Slider handlers
  const handleSliderChange = useCallback((values: number[]) => {
    const [newMin, newMax] = values;
    setIsUserInteracting(true);
    setLocalSliderValue([newMin, newMax]);
    setLocalMinInput(newMin.toString());
    setLocalMaxInput(newMax.toString());
  }, []);

  const handleSliderCommit = useCallback(
    (values: number[]) => {
      const [newMin, newMax] = values;
      setIsUserInteracting(false);
      onChange({ min: newMin, max: newMax });
    },
    [onChange]
  );

  // Input handlers
  const handleMinInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setLocalMinInput(value);

      // Update slider immediately for visual feedback
      const numValue = parseInt(value) || min;
      const clampedValue = Math.max(
        min,
        Math.min(numValue, localSliderValue[1])
      );
      setLocalSliderValue([clampedValue, localSliderValue[1]]);
    },
    [min, localSliderValue]
  );

  const handleMaxInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setLocalMaxInput(value);

      // Update slider immediately for visual feedback
      const numValue = parseInt(value) || max;
      const clampedValue = Math.min(
        max,
        Math.max(numValue, localSliderValue[0])
      );
      setLocalSliderValue([localSliderValue[0], clampedValue]);
    },
    [max, localSliderValue]
  );

  const commitInputValues = useCallback(() => {
    const newMin = Math.max(min, Math.min(parseInt(localMinInput) || min, max));
    const newMax = Math.min(max, Math.max(parseInt(localMaxInput) || max, min));

    // Ensure min <= max
    const finalMin = Math.min(newMin, newMax);
    const finalMax = Math.max(newMin, newMax);

    // Update local state to reflect clamped values
    setLocalMinInput(finalMin.toString());
    setLocalMaxInput(finalMax.toString());
    setLocalSliderValue([finalMin, finalMax]);

    // Update parent
    onChange({ min: finalMin, max: finalMax });
    setIsUserInteracting(false);
  }, [localMinInput, localMaxInput, min, max, onChange]);

  const handleMinInputBlur = useCallback(() => {
    commitInputValues();
  }, [commitInputValues]);

  const handleMaxInputBlur = useCallback(() => {
    commitInputValues();
  }, [commitInputValues]);

  const handleMinInputFocus = useCallback(() => {
    setIsUserInteracting(true);
  }, []);

  const handleMaxInputFocus = useCallback(() => {
    setIsUserInteracting(true);
  }, []);

  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.currentTarget.blur(); // This will trigger onBlur which commits the value
      }
    },
    []
  );

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="space-y-3">
        <h4 className="font-medium text-sm">Ціна (₴)</h4>

        {/* Slider */}
        <div className="px-2">
          <Slider
            value={localSliderValue}
            onValueChange={handleSliderChange}
            onValueCommit={handleSliderCommit}
            max={max}
            min={min}
            step={1}
            className="w-full"
          />
        </div>

        {/* Value display */}
        <div className="flex justify-between text-xs text-muted-foreground px-2">
          <span>{localSliderValue[0]} ₴</span>
          <span>{localSliderValue[1]} ₴</span>
        </div>
      </div>

      {/* Input fields */}
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Від</label>
            <Input
              type="number"
              value={localMinInput}
              onChange={handleMinInputChange}
              onBlur={handleMinInputBlur}
              onFocus={handleMinInputFocus}
              onKeyDown={handleInputKeyDown}
              min={min}
              max={max}
              className="text-sm h-8"
              placeholder={min.toString()}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">До</label>
            <Input
              type="number"
              value={localMaxInput}
              onChange={handleMaxInputChange}
              onBlur={handleMaxInputBlur}
              onFocus={handleMaxInputFocus}
              onKeyDown={handleInputKeyDown}
              min={min}
              max={max}
              className="text-sm h-8"
              placeholder={max.toString()}
            />
          </div>
        </div>
        <div className="text-xs text-muted-foreground text-center">
          Діапазон: {min} - {max} ₴
        </div>
      </div>
    </div>
  );
}
