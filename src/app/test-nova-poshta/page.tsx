"use client";

import { useState } from "react";
import { novaPoshtaApi } from "@/services/novaPoshtaApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import WarehouseAutocomplete from "@/components/WarehouseAutocomplete";

export default function TestNovaPoshtaPage() {
  const [cityQuery, setCityQuery] = useState("");
  const [cities, setCities] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [selectedCity, setSelectedCity] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedWarehouse, setSelectedWarehouse] = useState<any>(null);
  const [customAddress, setCustomAddress] = useState("");

  const testCitySearch = async () => {
    if (!cityQuery.trim()) return;

    setLoading(true);
    setError("");
    try {
      console.log("Searching for cities:", cityQuery);
      const results = await novaPoshtaApi.searchCities(cityQuery);
      console.log("Cities found:", results);
      setCities(results);
    } catch (err) {
      console.error("Error:", err);
      setError(`Error: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const testWarehouseSearch = async (city: any) => {
    setLoading(true);
    setError("");
    try {
      console.log("Searching warehouses for city:", city);
      const results = await novaPoshtaApi.getWarehouses(city.Ref);
      console.log("Warehouses found:", results);
      setWarehouses(results);
      setSelectedCity(city);
    } catch (err) {
      console.error("Error:", err);
      setError(`Error: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-8">Nova Poshta API Test</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* City Search Test */}
        <div className="bg-white p-6 border rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Test City Search</h2>
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Enter city name (e.g., Київ, Львів)"
              value={cityQuery}
              onChange={(e) => setCityQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && testCitySearch()}
            />
            <Button onClick={testCitySearch} disabled={loading}>
              {loading ? "Loading..." : "Search Cities"}
            </Button>
          </div>

          {cities.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">
                Found Cities ({cities.length}):
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {cities.map((city, index) => (
                  <div
                    key={city.Ref || index}
                    className="p-2 border rounded hover:bg-gray-50 cursor-pointer"
                    onClick={() => testWarehouseSearch(city)}
                  >
                    <div className="font-medium">{city.Description}</div>
                    <div className="text-sm text-gray-600">
                      {city.SettlementTypeDescription}, {city.AreaDescription}
                    </div>
                    <div className="text-xs text-gray-400">Ref: {city.Ref}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Warehouse Search Results */}
        {selectedCity && (
          <div className="bg-white p-6 border rounded-lg">
            <h2 className="text-lg font-semibold mb-4">
              Warehouses in {selectedCity.Description} ({warehouses.length})
            </h2>
            {warehouses.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {warehouses.map((warehouse, index) => (
                  <div
                    key={warehouse.Ref || index}
                    className="p-2 border rounded"
                  >
                    <div className="font-medium">
                      {(() => {
                        const type =
                          warehouse.TypeOfWarehouse?.toLowerCase() || "";
                        const address =
                          warehouse.ShortAddress || warehouse.Description || "";

                        if (
                          type.includes("поштомат") ||
                          type.includes("postomat") ||
                          type.includes("postal") ||
                          warehouse.Description?.toLowerCase().includes(
                            "поштомат"
                          ) ||
                          warehouse.DescriptionRu?.toLowerCase().includes(
                            "поштомат"
                          )
                        ) {
                          return `Поштомат №${warehouse.Number}${
                            address ? `: ${address}` : ""
                          }`;
                        }
                        return `Відділення №${warehouse.Number}${
                          address ? `: ${address}` : ""
                        }`;
                      })()}
                    </div>
                    <div className="text-sm text-gray-600">
                      {warehouse.ShortAddress}
                    </div>
                    <div className="text-xs text-gray-400">
                      Ref: {warehouse.Ref}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No warehouses found</p>
            )}
          </div>
        )}

        {/* New Warehouse Autocomplete Test */}
        {selectedCity && (
          <div className="bg-white p-6 border rounded-lg">
            <h2 className="text-lg font-semibold mb-4">
              Test New Warehouse Autocomplete for {selectedCity.Description}
            </h2>
            <div className="space-y-4">
              <WarehouseAutocomplete
                cityRef={selectedCity.Ref}
                value={
                  selectedWarehouse
                    ? (() => {
                        const type =
                          selectedWarehouse.TypeOfWarehouse?.toLowerCase() ||
                          "";
                        const address =
                          selectedWarehouse.ShortAddress ||
                          selectedWarehouse.Description ||
                          "";

                        if (
                          type.includes("поштомат") ||
                          type.includes("postomat") ||
                          type.includes("postal") ||
                          selectedWarehouse.Description?.toLowerCase().includes(
                            "поштомат"
                          ) ||
                          selectedWarehouse.DescriptionRu?.toLowerCase().includes(
                            "поштомат"
                          )
                        ) {
                          return `Поштомат №${selectedWarehouse.Number}${
                            address ? `: ${address}` : ""
                          }`;
                        }
                        return `Відділення №${selectedWarehouse.Number}${
                          address ? `: ${address}` : ""
                        }`;
                      })()
                    : customAddress || ""
                }
                onChange={(warehouse, address) => {
                  setSelectedWarehouse(warehouse);
                  setCustomAddress(address || "");
                  console.log("Warehouse selected:", warehouse);
                  console.log("Custom address:", address);
                }}
                placeholder="Введіть номер відділення"
              />

              <div className="text-sm bg-gray-50 p-3 rounded">
                <p>
                  <strong>Selected Warehouse:</strong>{" "}
                  {selectedWarehouse
                    ? `№${selectedWarehouse.Number} - ${selectedWarehouse.ShortAddress}`
                    : "None"}
                </p>
                <p>
                  <strong>Custom Address:</strong> {customAddress || "None"}
                </p>
                <p>
                  <strong>Input Type:</strong>{" "}
                  {selectedWarehouse
                    ? "Warehouse Selected"
                    : customAddress
                    ? "Manual Input"
                    : "None"}
                </p>
                <p>
                  <strong>Value:</strong>{" "}
                  {selectedWarehouse
                    ? (() => {
                        const type =
                          selectedWarehouse.TypeOfWarehouse?.toLowerCase() ||
                          "";
                        const address =
                          selectedWarehouse.ShortAddress ||
                          selectedWarehouse.Description ||
                          "";

                        if (
                          type.includes("поштомат") ||
                          type.includes("postomat") ||
                          type.includes("postal") ||
                          selectedWarehouse.Description?.toLowerCase().includes(
                            "поштомат"
                          ) ||
                          selectedWarehouse.DescriptionRu?.toLowerCase().includes(
                            "поштомат"
                          )
                        ) {
                          return `Поштомат №${selectedWarehouse.Number}${
                            address ? `: ${address}` : ""
                          }`;
                        }
                        return `Відділення №${selectedWarehouse.Number}${
                          address ? `: ${address}` : ""
                        }`;
                      })()
                    : customAddress || "None"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Raw API Response */}
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="font-medium mb-2">Debug Info:</h3>
          <div className="text-sm">
            <p>
              <strong>API URL:</strong> https://api.novaposhta.ua/v2.0/json/
            </p>
            <p>
              <strong>API Key:</strong> c8be07eac251641182e5575f8ee0da40
            </p>
            <p>
              <strong>Last Query:</strong> {cityQuery}
            </p>
            <p>
              <strong>Cities Found:</strong> {cities.length}
            </p>
            <p>
              <strong>Warehouses Found:</strong> {warehouses.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
