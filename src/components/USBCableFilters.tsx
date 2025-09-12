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
import { useProductStore } from "@/store/productStore";

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

  // Get USB filter options from store
  const { usbFilterOptions, setUsbFilterOptions } = useProductStore();

  // Load USB filter options from API if not cached
  useEffect(() => {
    const loadUsbFilterOptions = async () => {
      // Check if options are already loaded
      if (
        usbFilterOptions.inputConnectors.length > 0 ||
        usbFilterOptions.outputConnectors.length > 0 ||
        usbFilterOptions.cableLengths.length > 0
      ) {
        console.log("USBCableFilters: Using cached USB filter options");
        return;
      }

      console.log("USBCableFilters: Loading USB filter options from API");
      try {
        const response = await fetch(`/api/filter-options?categoryId=${categoryId}`);
        const data = await response.json();

        if (data.success && data.options) {
          console.log("USBCableFilters: Loaded USB filter options:", data.options);
          setUsbFilterOptions(data.options);
        } else {
          console.error("USBCableFilters: Failed to load USB filter options:", data);
        }
      } catch (error) {
        console.error("USBCableFilters: Error loading USB filter options:", error);
      }
    };

    if (categoryId) {
      loadUsbFilterOptions();
    }
  }, [categoryId, usbFilterOptions, setUsbFilterOptions]);

  // Convert arrays to filter options format
  const options = {
    inputConnectors: usbFilterOptions.inputConnectors.map(connector => ({
      value: connector,
      label: connector
    })),
    outputConnectors: usbFilterOptions.outputConnectors.map(connector => ({
      value: connector,
      label: connector
    })),
    cableLengths: usbFilterOptions.cableLengths.map(length => ({
      value: length,
      label: `${length} метра`
    })),
  };

  // Handle individual filter changes
  const handleInputConnectorChange = useCallback(
    (value: string) => {
      console.log(
        "USBCableFilters: handleInputConnectorChange called with:",
        value
      );
      setInputConnector(value);

      // Update parent with current values
      const newFilters = {
        inputConnector: value === "all" ? "" : value,
        outputConnector: outputConnector === "all" ? "" : outputConnector,
        cableLength: cableLength === "all" ? "" : cableLength,
      };
      console.log("USBCableFilters: calling onFiltersChange with:", newFilters);
      onFiltersChange(newFilters);
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

      // Update parent with current values
      const newFilters = {
        inputConnector: inputConnector === "all" ? "" : inputConnector,
        outputConnector: value === "all" ? "" : value,
        cableLength: cableLength === "all" ? "" : cableLength,
      };
      onFiltersChange(newFilters);
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

      // Update parent with current values
      const newFilters = {
        inputConnector: inputConnector === "all" ? "" : inputConnector,
        outputConnector: outputConnector === "all" ? "" : outputConnector,
        cableLength: value === "all" ? "" : value,
      };
      onFiltersChange(newFilters);
    },
    [inputConnector, outputConnector, onFiltersChange]
  );

  const clearFilters = () => {
    setInputConnector("all");
    setOutputConnector("all");
    setCableLength("all");

    // Update parent with cleared values
    onFiltersChange({
      inputConnector: "",
      outputConnector: "",
      cableLength: "",
    });
  };

  const hasActiveFilters =
    (inputConnector && inputConnector !== "all") ||
    (outputConnector && outputConnector !== "all") ||
    (cableLength && cableLength !== "all");

  console.log("USBCableFilters render:", { categoryId, options });

  return (
    <div className="space-y-3">
      <h4 className="font-medium text-gray-900">Фільтри для кабелів</h4>
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
            <SelectContent className="z-[10000]">
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
            <SelectContent className="z-[10000]">
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
            <SelectContent className="z-[10000]">
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
