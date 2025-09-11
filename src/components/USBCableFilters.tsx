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

interface USBCableFiltersProps {
  onFiltersChange: (filters: {
    inputConnector?: string;
    outputConnector?: string;
    cableLength?: string;
  }) => void;
  categoryId?: number;
  values?: {
    inputConnector?: string;
    outputConnector?: string;
    cableLength?: string;
  }; // Add values prop for controlled component
}

interface FilterOption {
  value: string;
  label: string;
}

const USBCableFilters = memo(function USBCableFilters({
  onFiltersChange,
  categoryId,
  values,
}: USBCableFiltersProps) {
  const [inputConnector, setInputConnector] = useState<string>(
    values?.inputConnector || "all"
  );
  const [outputConnector, setOutputConnector] = useState<string>(
    values?.outputConnector || "all"
  );
  const [cableLength, setCableLength] = useState<string>(
    values?.cableLength || "all"
  );
  const [loading, setLoading] = useState(false);
  const [filtersLoaded, setFiltersLoaded] = useState(false);
  const [options, setOptions] = useState<{
    inputConnectors: FilterOption[];
    outputConnectors: FilterOption[];
    cableLengths: FilterOption[];
  }>({
    inputConnectors: [],
    outputConnectors: [],
    cableLengths: [],
  });

  // Load filter options when component mounts
  useEffect(() => {
    console.log("USBCableFilters useEffect:", {
      categoryId,
      filtersLoaded,
      hasOptions: options.inputConnectors.length > 0,
    });

    // Only load if we haven't loaded filters yet
    if (filtersLoaded) {
      console.log("Skipping USB filter load - already loaded");
      return;
    }

    // Always load options, but use categoryId 1002 for cables
    const effectiveCategoryId = 1002; // Always use 1002 for cables

    const loadOptions = async () => {
      console.log(
        "Loading USB filter options for effectiveCategoryId:",
        effectiveCategoryId
      );
      setLoading(true);
      try {
        const response = await fetch(
          `/api/filter-options?categoryId=${effectiveCategoryId}`
        );
        const data = await response.json();

        if (data.success && data.options) {
          const { inputConnectors, outputConnectors, cableLengths } =
            data.options;

          setOptions({
            inputConnectors: inputConnectors.map((value: string) => ({
              value,
              label: value,
            })),
            outputConnectors: outputConnectors.map((value: string) => ({
              value,
              label: value,
            })),
            cableLengths: cableLengths.map((value: string) => ({
              value,
              label: `${value} м`,
            })),
          });
          setFiltersLoaded(true);
        }
      } catch (error) {
        console.error("Error loading USB filter options:", error);
      } finally {
        setLoading(false);
      }
    };

    loadOptions();
  }, [filtersLoaded]); // Fixed: only depend on filtersLoaded

  // Handle individual filter changes
  const handleInputConnectorChange = useCallback((value: string) => {
    console.log(
      "USBCableFilters: handleInputConnectorChange called with:",
      value
    );
    setInputConnector(value);
    // Don't call onFiltersChange immediately - wait for apply button
  }, []);

  const handleOutputConnectorChange = useCallback((value: string) => {
    console.log(
      "USBCableFilters: handleOutputConnectorChange called with:",
      value
    );
    setOutputConnector(value);
    // Don't call onFiltersChange immediately - wait for apply button
  }, []);

  const handleCableLengthChange = useCallback((value: string) => {
    console.log("USBCableFilters: handleCableLengthChange called with:", value);
    setCableLength(value);
    // Don't call onFiltersChange immediately - wait for apply button
  }, []);

  const clearFilters = () => {
    setInputConnector("all");
    setOutputConnector("all");
    setCableLength("all");
    // Don't call onFiltersChange immediately - wait for apply button
  };

  const hasActiveFilters =
    (inputConnector && inputConnector !== "all") ||
    (outputConnector && outputConnector !== "all") ||
    (cableLength && cableLength !== "all");

  console.log("USBCableFilters render:", { categoryId, loading, options });

  // Always show cable filters with data

  return (
    <div className="space-y-3">
      <h4 className="font-medium text-gray-900">Фільтри для кабелів</h4>
      {loading ? (
        <div className="text-sm text-muted-foreground">
          Завантаження опцій...
        </div>
      ) : (
        <div className="space-y-2">
          {/* Input Connector */}
          {options.inputConnectors.length > 0 && (
            <Select
              value={inputConnector}
              onValueChange={handleInputConnectorChange}
            >
              <SelectTrigger className="w-full cursor-pointer">
                <SelectValue placeholder="Вхід (Тип коннектора)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="cursor-pointer">
                  Всі типи входів
                </SelectItem>
                {options.inputConnectors.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="cursor-pointer"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Output Connector */}
          {options.outputConnectors.length > 0 && (
            <Select
              value={outputConnector}
              onValueChange={handleOutputConnectorChange}
            >
              <SelectTrigger className="w-full cursor-pointer">
                <SelectValue placeholder="Вихід (Тип коннектора)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="cursor-pointer">
                  Всі типи виходів
                </SelectItem>
                {options.outputConnectors.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="cursor-pointer"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Cable Length */}
          {options.cableLengths.length > 0 && (
            <Select value={cableLength} onValueChange={handleCableLengthChange}>
              <SelectTrigger className="w-full cursor-pointer">
                <SelectValue placeholder="Довжина кабелю" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="cursor-pointer">
                  Всі довжини
                </SelectItem>
                {options.cableLengths.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="cursor-pointer"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      )}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="cursor-pointer w-full text-sm"
        >
          Очистити фільтри кабелів
        </Button>
      )}
    </div>
  );
});

export default USBCableFilters;
