"use client";

import { useState, useEffect, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";

interface USBCableFiltersProps {
  onFiltersChange: (filters: {
    inputConnector?: string;
    outputConnector?: string;
    cableLength?: string;
  }) => void;
  categoryId?: number;
}

interface FilterOption {
  value: string;
  label: string;
}

const USBCableFilters = memo(function USBCableFilters({
  onFiltersChange,
  categoryId,
}: USBCableFiltersProps) {
  const [inputConnector, setInputConnector] = useState<string>("");
  const [outputConnector, setOutputConnector] = useState<string>("");
  const [cableLength, setCableLength] = useState<string>("");
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
  const handleInputConnectorChange = useCallback(
    (value: string) => {
      console.log(
        "USBCableFilters: handleInputConnectorChange called with:",
        value
      );
      setInputConnector(value);
      const filters = {
        inputConnector: value || undefined,
        outputConnector: outputConnector || undefined,
        cableLength: cableLength || undefined,
      };
      console.log("USBCableFilters: calling onFiltersChange with:", filters);
      onFiltersChange(filters);
    },
    [outputConnector, cableLength, onFiltersChange]
  );

  const handleOutputConnectorChange = useCallback(
    (value: string) => {
      console.log(
        "USBCableFilters: handleOutputConnectorChange called with:",
        value
      );
      setOutputConnector(value);
      const filters = {
        inputConnector: inputConnector || undefined,
        outputConnector: value || undefined,
        cableLength: cableLength || undefined,
      };
      console.log("USBCableFilters: calling onFiltersChange with:", filters);
      onFiltersChange(filters);
    },
    [inputConnector, cableLength, onFiltersChange]
  );

  const handleCableLengthChange = useCallback(
    (value: string) => {
      console.log(
        "USBCableFilters: handleCableLengthChange called with:",
        value
      );
      setCableLength(value);
      const filters = {
        inputConnector: inputConnector || undefined,
        outputConnector: outputConnector || undefined,
        cableLength: value || undefined,
      };
      console.log("USBCableFilters: calling onFiltersChange with:", filters);
      onFiltersChange(filters);
    },
    [inputConnector, outputConnector, onFiltersChange]
  );

  const clearFilters = () => {
    setInputConnector("");
    setOutputConnector("");
    setCableLength("");
  };

  const hasActiveFilters = inputConnector || outputConnector || cableLength;

  console.log("USBCableFilters render:", { categoryId, loading, options });

  // Always show cable filters with data

  return (
    <div className="space-y-4">
      <h4 className="font-medium">Фільтри для кабелів</h4>
      {loading ? (
        <div className="text-sm text-muted-foreground">
          Завантаження опцій...
        </div>
      ) : (
        <div className="space-y-3">
          {/* Input Connector */}
          {options.inputConnectors.length > 0 && (
            <select
              value={inputConnector}
              onChange={(e) => handleInputConnectorChange(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Вхід (Тип коннектора)</option>
              {options.inputConnectors.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}

          {/* Output Connector */}
          {options.outputConnectors.length > 0 && (
            <select
              value={outputConnector}
              onChange={(e) => handleOutputConnectorChange(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Вихід (Тип коннектора)</option>
              {options.outputConnectors.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}

          {/* Cable Length */}
          {options.cableLengths.length > 0 && (
            <select
              value={cableLength}
              onChange={(e) => handleCableLengthChange(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Довжина кабелю</option>
              {options.cableLengths.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}
        </div>
      )}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="cursor-pointer w-full"
        >
          Очистити фільтри кабелів
        </Button>
      )}
    </div>
  );
});

export default USBCableFilters;
