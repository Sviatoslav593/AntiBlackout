"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronDown, MapPin, Loader2 } from "lucide-react";
import {
  novaPoshtaApi,
  NovaPoshtaCity,
  formatCityName,
} from "@/services/novaPoshtaApi";

interface CityAutocompleteProps {
  value: string;
  onChange: (city: NovaPoshtaCity | null) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
}

export default function CityAutocomplete({
  value,
  onChange,
  placeholder = "Почніть вводити назву населеного пункту",
  error,
  disabled = false,
}: CityAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [cities, setCities] = useState<NovaPoshtaCity[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Debounced search function
  const debouncedSearch = useCallback((searchQuery: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      if (searchQuery.trim().length < 2) {
        setCities([]);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);
      try {
        const results = await novaPoshtaApi.searchCities(searchQuery);
        setCities(results);
        setIsOpen(results.length > 0);
        setSelectedIndex(-1);
      } catch (error) {
        console.error("Error searching cities:", error);
        console.error("Search query was:", searchQuery);
        setCities([]);
        setIsOpen(false);
      } finally {
        setIsLoading(false);
      }
    }, 300);
  }, []);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    debouncedSearch(newQuery);

    // Clear selection if user types something different
    if (newQuery !== value) {
      onChange(null);
    }
  };

  // Handle city selection
  const handleCitySelect = (city: NovaPoshtaCity) => {
    const formattedName = formatCityName(city);
    setQuery(formattedName);
    setIsOpen(false);
    setSelectedIndex(-1);
    onChange(city);
    inputRef.current?.blur();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || cities.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev < cities.length - 1 ? prev + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : cities.length - 1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < cities.length) {
          handleCitySelect(cities[selectedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Handle focus
  const handleFocus = () => {
    if (query.length >= 2 && cities.length > 0) {
      setIsOpen(true);
    }
  };

  // Handle blur with delay to allow clicks
  const handleBlur = () => {
    setTimeout(() => {
      setIsOpen(false);
      setSelectedIndex(-1);
    }, 150);
  };

  // Update query when value prop changes
  useEffect(() => {
    if (value !== query) {
      setQuery(value);
    }
  }, [value, query]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

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
          disabled={disabled}
          className={`
            w-full px-4 py-3 pr-12 border rounded-lg
            bg-white text-foreground placeholder-muted-foreground
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            transition-colors duration-200
            ${error ? "border-red-500" : "border-border"}
            ${disabled ? "bg-muted cursor-not-allowed" : ""}
          `}
        />

        {/* Icon */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          {isLoading ? (
            <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
          ) : (
            <div className="flex items-center space-x-1">
              <MapPin className="h-4 w-4 text-muted-foreground" />
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
      {isOpen && cities.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {cities.map((city, index) => (
            <button
              key={city.Ref}
              type="button"
              onClick={() => handleCitySelect(city)}
              className={`
                w-full px-4 py-3 text-left hover:bg-muted/50 border-b border-border last:border-b-0
                focus:outline-none focus:bg-muted/50 transition-colors duration-150
                ${index === selectedIndex ? "bg-muted/70" : ""}
              `}
            >
              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-foreground truncate">
                    {city.Description}
                  </div>
                  <div className="text-sm text-muted-foreground truncate">
                    {city.SettlementTypeDescription}, {city.AreaDescription}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No Results */}
      {isOpen && !isLoading && query.length >= 2 && cities.length === 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-border rounded-lg shadow-lg p-4 text-center">
          <div className="text-muted-foreground">
            <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Населений пункт не знайдено</p>
            <p className="text-xs mt-1">Спробуйте змінити запит</p>
          </div>
        </div>
      )}
    </div>
  );
}
