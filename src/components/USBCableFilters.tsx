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

export default function USBCableFilters({
  onFiltersChange,
  categoryId,
}: USBCableFiltersProps) {
  const [inputConnector, setInputConnector] = useState<string>("");
  const [outputConnector, setOutputConnector] = useState<string>("");
  const [cableLength, setCableLength] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<{
    inputConnectors: FilterOption[];
    outputConnectors: FilterOption[];
    cableLengths: FilterOption[];
  }>({
    inputConnectors: [],
    outputConnectors: [],
    cableLengths: [],
  });

  // Load filter options when categoryId changes
  useEffect(() => {
    if (!categoryId || categoryId !== 1002) return;

    const loadOptions = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/filter-options?categoryId=${categoryId}`
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
        }
      } catch (error) {
        console.error("Error loading filter options:", error);
      } finally {
        setLoading(false);
      }
    };

    loadOptions();
  }, [categoryId]);

  // Handle individual filter changes
  const handleInputConnectorChange = useCallback(
    (value: string) => {
      setInputConnector(value);
      onFiltersChange({
        inputConnector: value || undefined,
        outputConnector: outputConnector || undefined,
        cableLength: cableLength || undefined,
      });
    },
    [outputConnector, cableLength, onFiltersChange]
  );

  const handleOutputConnectorChange = useCallback(
    (value: string) => {
      setOutputConnector(value);
      onFiltersChange({
        inputConnector: inputConnector || undefined,
        outputConnector: value || undefined,
        cableLength: cableLength || undefined,
      });
    },
    [inputConnector, cableLength, onFiltersChange]
  );

  const handleCableLengthChange = useCallback(
    (value: string) => {
      setCableLength(value);
      onFiltersChange({
        inputConnector: inputConnector || undefined,
        outputConnector: outputConnector || undefined,
        cableLength: value || undefined,
      });
    },
    [inputConnector, outputConnector, onFiltersChange]
  );

  const clearFilters = () => {
    setInputConnector("");
    setOutputConnector("");
    setCableLength("");
  };

  const hasActiveFilters = inputConnector || outputConnector || cableLength;

  if (categoryId !== 1002) {
    return null;
  }

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
            <Select
              value={inputConnector}
              onValueChange={handleInputConnectorChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Вхід (Тип коннектора)" />
              </SelectTrigger>
              <SelectContent>
                {options.inputConnectors.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
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
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Вихід (Тип коннектора)" />
              </SelectTrigger>
              <SelectContent>
                {options.outputConnectors.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Cable Length */}
          {options.cableLengths.length > 0 && (
            <Select value={cableLength} onValueChange={handleCableLengthChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Довжина кабелю" />
              </SelectTrigger>
              <SelectContent>
                {options.cableLengths.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
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
          className="cursor-pointer w-full"
        >
          Очистити фільтри кабелів
        </Button>
      )}
    </div>
  );
}
