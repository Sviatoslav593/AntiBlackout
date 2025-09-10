"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronDown } from "lucide-react";

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
  
  const [isInputOpen, setIsInputOpen] = useState(false);
  const [isOutputOpen, setIsOutputOpen] = useState(false);
  const [isLengthOpen, setIsLengthOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load filter options from products
  const loadFilterOptions = useCallback(async () => {
    if (!categoryId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/products?categoryId=${categoryId}`);
      const data = await response.json();
      
      if (data.success && data.products) {
        const products = data.products;
        
        // Extract input connector options
        const inputMap = new Map<string, number>();
        const outputMap = new Map<string, number>();
        const lengthMap = new Map<string, number>();
        
        products.forEach((product: any) => {
          if (product.characteristics) {
            // Input connector
            const input = product.characteristics["Вхід (Тип коннектора)"];
            if (input) {
              inputMap.set(input, (inputMap.get(input) || 0) + 1);
            }
            
            // Output connector
            const output = product.characteristics["Вихід (Тип коннектора)"];
            if (output) {
              outputMap.set(output, (outputMap.get(output) || 0) + 1);
            }
            
            // Cable length
            const length = product.characteristics["Довжина кабелю, м"];
            if (length) {
              lengthMap.set(length, (lengthMap.get(length) || 0) + 1);
            }
          }
        });
        
        // Convert to options arrays
        setInputOptions(
          Array.from(inputMap.entries())
            .map(([value, count]) => ({ value, label: value, count }))
            .sort((a, b) => a.label.localeCompare(b.label))
        );
        
        setOutputOptions(
          Array.from(outputMap.entries())
            .map(([value, count]) => ({ value, label: value, count }))
            .sort((a, b) => a.label.localeCompare(b.label))
        );
        
        setLengthOptions(
          Array.from(lengthMap.entries())
            .map(([value, count]) => ({ value, label: value, count }))
            .sort((a, b) => {
              // Sort lengths numerically
              const aNum = parseFloat(a.value);
              const bNum = parseFloat(b.value);
              if (!isNaN(aNum) && !isNaN(bNum)) {
                return aNum - bNum;
              }
              return a.label.localeCompare(b.label);
            })
        );
      }
    } catch (error) {
      console.error("Error loading filter options:", error);
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    loadFilterOptions();
  }, [loadFilterOptions]);

  // Debounced filter change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onFiltersChange({
        inputConnector: inputConnector || undefined,
        outputConnector: outputConnector || undefined,
        cableLength: cableLength || undefined,
      });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [inputConnector, outputConnector, cableLength, onFiltersChange]);

  const clearFilters = () => {
    setInputConnector("");
    setOutputConnector("");
    setCableLength("");
  };

  const hasActiveFilters = inputConnector || outputConnector || cableLength;

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900">Фільтри USB кабелів</h3>
        <div className="space-y-3">
          <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Фільтри USB кабелів</h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Очистити
          </button>
        )}
      </div>

      <div className="space-y-3">
        {/* Input Connector Filter */}
        <div className="relative">
          <button
            onClick={() => setIsInputOpen(!isInputOpen)}
            className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <span className={inputConnector ? "text-gray-900" : "text-gray-500"}>
              {inputConnector || "Вхід (Тип коннектора)"}
            </span>
            <ChevronDown className={`h-4 w-4 transition-transform ${isInputOpen ? "rotate-180" : ""}`} />
          </button>
          
          {isInputOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
              {inputOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setInputConnector(option.value === inputConnector ? "" : option.value);
                    setIsInputOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex justify-between items-center ${
                    inputConnector === option.value ? "bg-blue-50 text-blue-900" : "text-gray-900"
                  }`}
                >
                  <span>{option.label}</span>
                  <span className="text-gray-500 text-xs">({option.count})</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Output Connector Filter */}
        <div className="relative">
          <button
            onClick={() => setIsOutputOpen(!isOutputOpen)}
            className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <span className={outputConnector ? "text-gray-900" : "text-gray-500"}>
              {outputConnector || "Вихід (Тип коннектора)"}
            </span>
            <ChevronDown className={`h-4 w-4 transition-transform ${isOutputOpen ? "rotate-180" : ""}`} />
          </button>
          
          {isOutputOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
              {outputOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setOutputConnector(option.value === outputConnector ? "" : option.value);
                    setIsOutputOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex justify-between items-center ${
                    outputConnector === option.value ? "bg-blue-50 text-blue-900" : "text-gray-900"
                  }`}
                >
                  <span>{option.label}</span>
                  <span className="text-gray-500 text-xs">({option.count})</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Cable Length Filter */}
        <div className="relative">
          <button
            onClick={() => setIsLengthOpen(!isLengthOpen)}
            className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <span className={cableLength ? "text-gray-900" : "text-gray-500"}>
              {cableLength || "Довжина кабелю, м"}
            </span>
            <ChevronDown className={`h-4 w-4 transition-transform ${isLengthOpen ? "rotate-180" : ""}`} />
          </button>
          
          {isLengthOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
              {lengthOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setCableLength(option.value === cableLength ? "" : option.value);
                    setIsLengthOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex justify-between items-center ${
                    cableLength === option.value ? "bg-blue-50 text-blue-900" : "text-gray-900"
                  }`}
                >
                  <span>{option.label}</span>
                  <span className="text-gray-500 text-xs">({option.count})</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
