"use client";

import { useState, useEffect, useRef } from "react";
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
  const hasLoadedRef = useRef(false);

  // Load filter options from products - only once when component mounts
  useEffect(() => {
    console.log(
      "USBCableFilters: useEffect triggered - categoryId:",
      categoryId,
      "hasLoadedRef:",
      hasLoadedRef.current
    );

    if (!categoryId || hasLoadedRef.current) {
      console.log(
        "USBCableFilters: Skipping load - categoryId:",
        categoryId,
        "hasLoadedRef:",
        hasLoadedRef.current
      );
      return;
    }

    const loadOptions = async () => {
      console.log(
        "USBCableFilters: Loading options for categoryId:",
        categoryId
      );
      setLoading(true);

      try {
        const response = await fetch(
          `/api/filter-options?categoryId=${categoryId}`
        );
        const data = await response.json();
        console.log("USBCableFilters: Filter options API response:", data);

        if (data.success && data.options) {
          const { inputConnectors, outputConnectors, cableLengths } =
            data.options;

          // Set input options
          setInputOptions(
            inputConnectors.map((value: string) => ({
              value,
              label: value,
              count: 0,
            }))
          );

          // Set output options
          setOutputOptions(
            outputConnectors.map((value: string) => ({
              value,
              label: value,
              count: 0,
            }))
          );

          // Set length options
          setLengthOptions(
            cableLengths.map((value: string) => ({
              value,
              label: value,
              count: 0,
            }))
          );

          console.log("USBCableFilters: Successfully loaded options:", {
            input: inputConnectors.length,
            output: outputConnectors.length,
            length: cableLengths.length,
          });

          hasLoadedRef.current = true;
          setIsLoaded(true);
          console.log("USBCableFilters: Set hasLoadedRef.current = true and isLoaded = true");
        } else {
          console.error("USBCableFilters: API returned error:", data.error);
          hasLoadedRef.current = true; // Mark as loaded even on error to prevent retries
        }
      } catch (error) {
        console.error("Error loading filter options:", error);
      } finally {
        setLoading(false);
      }
    };

    loadOptions();
  }, [categoryId]); // Removed isLoaded from dependencies to prevent infinite loop

  // Debounced filter change - only when values change
  useEffect(() => {
    // Don't call onFiltersChange until options are loaded
    if (!isLoaded) {
      console.log("USBCableFilters: Skipping onFiltersChange - options not loaded yet");
      return;
    }

    console.log("USBCableFilters: Filter values changed:", {
      inputConnector,
      outputConnector,
      cableLength,
    });

    const timeoutId = setTimeout(() => {
      console.log("USBCableFilters: Calling onFiltersChange");
      onFiltersChange({
        inputConnector: inputConnector || undefined,
        outputConnector: outputConnector || undefined,
        cableLength: cableLength || undefined,
      });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [inputConnector, outputConnector, cableLength, isLoaded]);

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
        <div className="text-sm text-muted-foreground">
          Завантаження опцій...
        </div>
      ) : (
        <div className="space-y-3">
          {/* Input Connector */}
          {inputOptions.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Вхід (Тип коннектора)
              </label>
              <div className="relative">
                <button
                  type="button"
                  className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onClick={() => setIsInputOpen(!isInputOpen)}
                >
                  <span
                    className={
                      inputConnector ? "text-gray-900" : "text-gray-500"
                    }
                  >
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
              <label className="text-sm font-medium">
                Вихід (Тип коннектора)
              </label>
              <div className="relative">
                <button
                  type="button"
                  className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onClick={() => setIsOutputOpen(!isOutputOpen)}
                >
                  <span
                    className={
                      outputConnector ? "text-gray-900" : "text-gray-500"
                    }
                  >
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
                  <span
                    className={cableLength ? "text-gray-900" : "text-gray-500"}
                  >
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
