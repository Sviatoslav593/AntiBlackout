"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronDown, Package, Loader2, MapPin } from "lucide-react";
import {
  novaPoshtaApi,
  NovaPoshtaWarehouse,
  formatWarehouseName,
} from "@/services/novaPoshtaApi";

interface WarehouseAutocompleteProps {
  cityRef: string | null;
  value: string;
  onChange: (
    warehouse: NovaPoshtaWarehouse | null,
    customAddress?: string
  ) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
}

export default function WarehouseAutocomplete({
  cityRef,
  value,
  onChange,
  placeholder = "Введіть номер відділення",
  error,
  disabled = false,
}: WarehouseAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [warehouses, setWarehouses] = useState<NovaPoshtaWarehouse[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search function
  const debouncedSearch = useCallback(
    (searchQuery: string = "") => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(async () => {
        if (!cityRef) {
          setWarehouses([]);
          setIsOpen(false);
          return;
        }

        setIsLoading(true);
        try {
          const allWarehouses = await novaPoshtaApi.getWarehouses(cityRef);

          if (searchQuery.trim().length < 1) {
            // Show all warehouses when query is empty
            setWarehouses(allWarehouses);
            setIsOpen(allWarehouses.length > 0);
            setSelectedIndex(-1);
          } else {
            // Filter warehouses by name and number only (not address)
            const filtered = allWarehouses.filter((warehouse) => {
              const warehouseNum = warehouse.Number?.toString() || "";
              const warehouseName = `Відділення №${warehouse.Number}`;
              const searchTerm = searchQuery.toLowerCase();

              return (
                warehouseNum.includes(searchTerm) ||
                warehouseName.toLowerCase().includes(searchTerm) ||
                `№${warehouseNum}`.includes(searchTerm) ||
                `#${warehouseNum}`.includes(searchTerm)
              );
            });

            setWarehouses(filtered);
            setIsOpen(filtered.length > 0);
            setSelectedIndex(-1);
          }
        } catch (error) {
          console.error("Error loading warehouses:", error);
          setWarehouses([]);
          setIsOpen(false);
        } finally {
          setIsLoading(false);
        }
      }, 300);
    },
    [cityRef]
  );

  // Update query when value prop changes
  useEffect(() => {
    if (value !== query) {
      setQuery(value);
    }
  }, [value]);

  // Load warehouses when city changes
  useEffect(() => {
    if (cityRef) {
      debouncedSearch(""); // Load all warehouses initially
    } else {
      setWarehouses([]);
      setIsOpen(false);
    }
  }, [cityRef, debouncedSearch]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    debouncedSearch(newQuery);

    // Clear selection if user types something different
    if (newQuery !== value) {
      onChange(null, newQuery);
    }
  };

  // Handle warehouse selection
  const handleWarehouseSelect = (warehouse: NovaPoshtaWarehouse) => {
    const warehouseName = `Відділення №${warehouse.Number}`;
    setQuery(warehouseName);
    setIsOpen(false);
    setSelectedIndex(-1);
    onChange(warehouse);
    inputRef.current?.blur();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || warehouses.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < warehouses.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : warehouses.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < warehouses.length) {
          handleWarehouseSelect(warehouses[selectedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Handle focus - always load warehouses when focused
  const handleFocus = () => {
    if (cityRef) {
      debouncedSearch(query); // This will load all warehouses if query is empty
    }
  };

  // Handle blur with delay to allow clicks
  const handleBlur = () => {
    setTimeout(() => {
      setIsOpen(false);
      setSelectedIndex(-1);
    }, 150);
  };

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && dropdownRef.current) {
      const selectedElement = dropdownRef.current.children[
        selectedIndex
      ] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }
  }, [selectedIndex]);

  return (
    <div className="relative w-full">
      {/* Input Field */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled || !cityRef}
          className={`
            w-full px-4 py-3 pr-12 border rounded-lg
            bg-white text-foreground placeholder-muted-foreground
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            transition-colors duration-200
            ${error ? "border-red-500" : "border-border"}
            ${disabled || !cityRef ? "bg-muted cursor-not-allowed" : ""}
          `}
        />

        {/* Icon */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          {isLoading ? (
            <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
          ) : (
            <div className="flex items-center space-x-1">
              <Package className="h-4 w-4 text-muted-foreground" />
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

      {/* Dropdown */}
      {isOpen && warehouses.length > 0 && cityRef && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {warehouses.map((warehouse, index) => (
            <button
              key={warehouse.Ref}
              type="button"
              onClick={() => handleWarehouseSelect(warehouse)}
              className={`
                w-full px-4 py-3 text-left hover:bg-muted/50 border-b border-border last:border-b-0
                focus:outline-none focus:bg-muted/50 transition-colors duration-150
                ${index === selectedIndex ? "bg-muted/70" : ""}
              `}
            >
              <div className="flex items-start space-x-2">
                <Package className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-foreground">
                    Відділення №{warehouse.Number}
                  </div>
                  <div className="text-sm text-muted-foreground truncate">
                    {warehouse.ShortAddress}
                  </div>
                  {warehouse.Schedule?.Monday && (
                    <div className="text-xs text-muted-foreground mt-1">
                      <MapPin className="h-3 w-3 inline mr-1" />
                      Режим роботи: {warehouse.Schedule.Monday}
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No Results */}
      {isOpen && !isLoading && query.length >= 1 && warehouses.length === 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-border rounded-lg shadow-lg p-4 text-center">
          <div className="text-muted-foreground">
            <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Відділення не знайдено</p>
            <p className="text-xs mt-1">Спробуйте змінити запит</p>
          </div>
        </div>
      )}
    </div>
  );
}
