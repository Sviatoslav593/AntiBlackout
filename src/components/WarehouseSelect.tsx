"use client";

import { useState, useEffect } from "react";
import { ChevronDown, Package, Loader2, MapPin } from "lucide-react";
import {
  novaPoshtaApi,
  NovaPoshtaWarehouse,
  formatWarehouseName,
} from "@/services/novaPoshtaApi";

interface WarehouseSelectProps {
  cityRef: string | null;
  value: string;
  onChange: (warehouse: NovaPoshtaWarehouse | null) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
}

export default function WarehouseSelect({
  cityRef,
  value,
  onChange,
  placeholder = "Оберіть відділення Нової пошти",
  error,
  disabled = false,
}: WarehouseSelectProps) {
  const [warehouses, setWarehouses] = useState<NovaPoshtaWarehouse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] =
    useState<NovaPoshtaWarehouse | null>(null);

  // Load warehouses when city changes
  useEffect(() => {
    const loadWarehouses = async () => {
      if (!cityRef) {
        setWarehouses([]);
        setSelectedWarehouse(null);
        onChange(null);
        return;
      }

      setIsLoading(true);
      try {
        const results = await novaPoshtaApi.getWarehouses(cityRef);
        setWarehouses(results);

        // If there's a current value, try to find the corresponding warehouse
        if (value && results.length > 0) {
          const foundWarehouse = results.find((w) => w.Ref === value);
          if (foundWarehouse) {
            setSelectedWarehouse(foundWarehouse);
          } else {
            // Value doesn't match any warehouse in new city, clear selection
            setSelectedWarehouse(null);
            onChange(null);
          }
        } else {
          setSelectedWarehouse(null);
          onChange(null);
        }
      } catch (error) {
        console.error("Error loading warehouses:", error);
        setWarehouses([]);
        setSelectedWarehouse(null);
        onChange(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadWarehouses();
  }, [cityRef, value, onChange]);

  // Handle warehouse selection
  const handleWarehouseSelect = (warehouse: NovaPoshtaWarehouse) => {
    setSelectedWarehouse(warehouse);
    onChange(warehouse);
    setIsOpen(false);
  };

  // Handle dropdown toggle
  const handleToggle = () => {
    if (disabled || !cityRef || warehouses.length === 0) return;
    setIsOpen(!isOpen);
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest("[data-warehouse-select]")) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Get display text
  const getDisplayText = () => {
    if (selectedWarehouse) {
      return formatWarehouseName(selectedWarehouse);
    }
    if (!cityRef) {
      return "Спочатку оберіть населений пункт";
    }
    if (isLoading) {
      return "Завантаження відділень...";
    }
    if (warehouses.length === 0) {
      return "Відділення не знайдено";
    }
    return placeholder;
  };

  // Determine if the select should be disabled
  const isSelectDisabled = disabled || !cityRef || warehouses.length === 0;

  return (
    <div className="relative w-full" data-warehouse-select>
      {/* Select Button */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={isSelectDisabled}
        className={`
          w-full px-4 py-3 pr-12 border rounded-lg text-left
          bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          transition-colors duration-200
          ${error ? "border-red-500" : "border-border"}
          ${
            isSelectDisabled
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : "text-foreground hover:border-muted-foreground cursor-pointer"
          }
        `}
      >
        <span
          className={
            selectedWarehouse ? "text-foreground" : "text-muted-foreground"
          }
        >
          {getDisplayText()}
        </span>
      </button>

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

      {/* Error Message */}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

      {/* Dropdown */}
      {isOpen && warehouses.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {warehouses.map((warehouse) => (
            <button
              key={warehouse.Ref}
              type="button"
              onClick={() => handleWarehouseSelect(warehouse)}
              className="w-full px-4 py-3 text-left hover:bg-muted/50 border-b border-border last:border-b-0 focus:outline-none focus:bg-muted/50 transition-colors duration-150"
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

      {/* No Warehouses Available */}
      {cityRef && !isLoading && warehouses.length === 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-border rounded-lg shadow-lg p-4 text-center">
          <div className="text-muted-foreground">
            <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Відділення не знайдено</p>
            <p className="text-xs mt-1">
              У цьому населеному пункті немає відділень Нової пошти
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
