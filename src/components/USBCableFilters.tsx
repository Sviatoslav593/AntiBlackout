"use client";

import { useState, useEffect } from "react";
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
  const [isLoaded, setIsLoaded] = useState(false);

  // Load filter options from products - only once when component mounts
  useEffect(() => {
    if (!categoryId || isLoaded) {
      return;
    }

    const loadOptions = async () => {
      console.log("USBCableFilters: Loading options for categoryId:", categoryId);
      setLoading(true);
      
      try {
        const response = await fetch(`/api/products?categoryId=${categoryId}`);
        const data = await response.json();
        console.log("USBCableFilters: API response:", data);

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
                lengthMap.set(String(length), (lengthMap.get(String(length)) || 0) + 1);
              }
            }
          });

          // Set input options
          setInputOptions(
            Array.from(inputMap.entries())
              .map(([value, count]) => ({ value, label: value, count }))
              .sort((a, b) => a.label.localeCompare(b.label))
          );

          // Set output options
          setOutputOptions(
            Array.from(outputMap.entries())
              .map(([value, count]) => ({ value, label: value, count }))
              .sort((a, b) => a.label.localeCompare(b.label))
          );

          // Set length options
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

          console.log("USBCableFilters: Loaded options:", {
            input: inputMap.size,
            output: outputMap.size,
            length: lengthMap.size,
          });

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

  // Debounced filter change - only when values change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onFiltersChange({
        inputConnector: inputConnector || undefined,
        outputConnector: outputConnector || undefined,
        cableLength: cableLength || undefined,
      });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [inputConnector, outputConnector, cableLength]);

  const clearFilters = () => {
    setInputConnector("");
    setOutputConnector("");
    setCableLength("");
  };

  if (!categoryId) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h4 className="font-medium">Фільтри для кабелів</h4>
      
      {loading ? (
        <div className="text-sm text-muted-foreground">Завантаження опцій...</div>
      ) : (
        <div className="space-y-3">
          {/* Input Connector */}
          {inputOptions.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Вхід (Тип коннектора)</label>
              <div className="relative">
                <button
                  type="button"
                  className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onClick={() => setIsInputOpen(!isInputOpen)}
                >
                  <span className={inputConnector ? "text-gray-900" : "text-gray-500"}>
                    {inputConnector || "Оберіть вхід"}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>
                
                {isInputOpen && (
                  <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    {inputOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                        onClick={() => {
                          setInputConnector(option.value);
                          setIsInputOpen(false);
                        }}
                      >
                        {option.label} ({option.count})
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Output Connector */}
          {outputOptions.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Вихід (Тип коннектора)</label>
              <div className="relative">
                <button
                  type="button"
                  className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onClick={() => setIsOutputOpen(!isOutputOpen)}
                >
                  <span className={outputConnector ? "text-gray-900" : "text-gray-500"}>
                    {outputConnector || "Оберіть вихід"}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>
                
                {isOutputOpen && (
                  <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    {outputOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                        onClick={() => {
                          setOutputConnector(option.value);
                          setIsOutputOpen(false);
                        }}
                      >
                        {option.label} ({option.count})
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Cable Length */}
          {lengthOptions.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Довжина кабелю, м</label>
              <div className="relative">
                <button
                  type="button"
                  className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onClick={() => setIsLengthOpen(!isLengthOpen)}
                >
                  <span className={cableLength ? "text-gray-900" : "text-gray-500"}>
                    {cableLength || "Оберіть довжину"}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>
                
                {isLengthOpen && (
                  <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    {lengthOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                        onClick={() => {
                          setCableLength(option.value);
                          setIsLengthOpen(false);
                        }}
                      >
                        {option.label} м ({option.count})
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {(inputConnector || outputConnector || cableLength) && (
        <button
          type="button"
          onClick={clearFilters}
          className="w-full px-3 py-2 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          Очистити фільтри кабелів
        </button>
      )}
    </div>
  );
}