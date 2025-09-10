"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
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
  count: number;
}

export default function USBCableFilters({
  onFiltersChange,
  categoryId,
}: USBCableFiltersProps) {
  const [inputConnector, setInputConnector] = useState<string>("");
  const [outputConnector, setOutputConnector] = useState<string>("");
  const [cableLength, setCableLength] = useState<string>("");

  const [inputOptions, setInputOptions] = useState<FilterOption[]>([]);
  const [outputOptions, setOutputOptions] = useState<FilterOption[]>([]);
  const [lengthOptions, setLengthOptions] = useState<FilterOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load filter options when categoryId changes
  useEffect(() => {
    if (!categoryId || isLoaded) return;

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

          setInputOptions(
            inputConnectors.map((value: string) => ({
              value,
              label: value,
              count: 0,
            }))
          );
          setOutputOptions(
            outputConnectors.map((value: string) => ({
              value,
              label: value,
              count: 0,
            }))
          );
          setLengthOptions(
            cableLengths.map((value: string) => ({
              value,
              label: value,
              count: 0,
            }))
          );
          setIsLoaded(true);
        }
      } catch (error) {
        console.error("Error loading filter options:", error);
      } finally {
        setLoading(false);
      }
    };

    loadOptions();
  }, [categoryId, isLoaded]);

  // Debounced filter change
  useEffect(() => {
    if (!isLoaded) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      onFiltersChange({
        inputConnector: inputConnector || undefined,
        outputConnector: outputConnector || undefined,
        cableLength: cableLength || undefined,
      });
    }, 300);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [inputConnector, outputConnector, cableLength, onFiltersChange, isLoaded]);

  const clearFilters = () => {
    setInputConnector("");
    setOutputConnector("");
    setCableLength("");
  };

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
          {inputOptions.length > 0 && (
            <Select value={inputConnector} onValueChange={setInputConnector}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Вхід (Тип коннектора)" />
              </SelectTrigger>
              <SelectContent className="z-[100]">
                {inputOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Output Connector */}
          {outputOptions.length > 0 && (
            <Select value={outputConnector} onValueChange={setOutputConnector}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Вихід (Тип коннектора)" />
              </SelectTrigger>
              <SelectContent className="z-[100]">
                {outputOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Cable Length */}
          {lengthOptions.length > 0 && (
            <Select value={cableLength} onValueChange={setCableLength}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Довжина кабелю, м" />
              </SelectTrigger>
              <SelectContent className="z-[100]">
                {lengthOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      )}
      {(inputConnector || outputConnector || cableLength) && (
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
