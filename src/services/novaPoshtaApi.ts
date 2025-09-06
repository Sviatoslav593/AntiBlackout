// Nova Poshta API Service
// Documentation: https://devcenter.novaposhta.ua/docs/services/

const API_BASE_URL = "https://api.novaposhta.ua/v2.0/json/";
const API_KEY = "c8be07eac251641182e5575f8ee0da40";

export interface NovaPoshtaCity {
  Description: string;
  DescriptionRu: string;
  Ref: string;
  Delivery1: string;
  Delivery2: string;
  Delivery3: string;
  Delivery4: string;
  Delivery5: string;
  Delivery6: string;
  Delivery7: string;
  Area: string;
  SettlementType: string;
  IsBranch: string;
  PreventEntryNewStreetsUser: string;
  CityID: string;
  SettlementTypeDescription: string;
  SpecialCashCheck: number;
  AreaDescription: string;
}

export interface NovaPoshtaWarehouse {
  SiteKey: string;
  Description: string;
  DescriptionRu: string;
  ShortAddress: string;
  ShortAddressRu: string;
  Phone: string;
  TypeOfWarehouse: string;
  Ref: string;
  Number: string;
  CityRef: string;
  CityDescription: string;
  CityDescriptionRu: string;
  SettlementRef: string;
  SettlementDescription: string;
  SettlementAreaDescription: string;
  SettlementRegionsDescription: string;
  SettlementTypeDescription: string;
  Longitude: string;
  Latitude: string;
  PostFinance: string;
  BicycleParking: string;
  PaymentAccess: string;
  POSTerminal: string;
  InternationalShipping: string;
  SelfServiceWorkplacesCount: string;
  TotalMaxWeightAllowed: string;
  PlaceMaxWeightAllowed: string;
  SendingLimitationsOnDimensions: {
    Width: number;
    Height: number;
    Length: number;
  };
  ReceivingLimitationsOnDimensions: {
    Width: number;
    Height: number;
    Length: number;
  };
  Reception: {
    Monday: string;
    Tuesday: string;
    Wednesday: string;
    Thursday: string;
    Friday: string;
    Saturday: string;
    Sunday: string;
  };
  Delivery: {
    Monday: string;
    Tuesday: string;
    Wednesday: string;
    Thursday: string;
    Friday: string;
    Saturday: string;
    Sunday: string;
  };
  Schedule: {
    Monday: string;
    Tuesday: string;
    Wednesday: string;
    Thursday: string;
    Friday: string;
    Saturday: string;
    Sunday: string;
  };
  DistrictCode: string;
  WarehouseStatus: string;
  WarehouseStatusDate: string;
  CategoryOfWarehouse: string;
  Direct: string;
  RegionCity: string;
  WarehouseForAgent: string;
  MaxDeclaredCost: string;
  WorkInMobileAwis: string;
  DenyToSelect: string;
  CanGetMoneyTransfer: string;
  HasMirror: string;
  HasFittingRoom: string;
  OnlyReceivingParcel: string;
  PostMachineType: string;
  PostalCodeUA: string;
  WarehouseIndex: string;
  BeaconCode: string;
}

export interface NovaPoshtaApiResponse<T> {
  success: boolean;
  data: T[];
  errors: string[];
  warnings: string[];
  info: string[];
  messageCodes: string[];
  errorCodes: string[];
  warningCodes: string[];
  infoCodes: string[];
}

class NovaPoshtaApiService {
  private makeRequest = async <T>(
    modelName: string,
    calledMethod: string,
    methodProperties: Record<string, unknown> = {}
  ): Promise<NovaPoshtaApiResponse<T>> => {
    try {
      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey: API_KEY,
          modelName,
          calledMethod,
          methodProperties,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Nova Poshta API Error:", error);
      throw new Error("Помилка з'єднання з сервісом доставки");
    }
  };

  /**
   * Get list of cities/settlements
   * @param cityName - Optional city name to filter results
   * @param limit - Maximum number of results (default: 50)
   */
  getCities = async (
    cityName?: string,
    limit = 50
  ): Promise<NovaPoshtaCity[]> => {
    try {
      const methodProperties: Record<string, string> = {
        FindByString:
          cityName && cityName.trim().length > 0 ? cityName.trim() : "",
      };

      const response = await this.makeRequest<NovaPoshtaCity>(
        "Address",
        "getCities",
        methodProperties
      );

      if (response.success) {
        return response.data || [];
      } else {
        console.error("Nova Poshta getCities errors:", response.errors);
        return [];
      }
    } catch (error) {
      console.error("Error getting cities:", error);
      return [];
    }
  };

  /**
   * Get list of warehouses for a specific city
   * @param cityRef - Reference ID of the city
   * @param warehouseType - Type of warehouse (optional)
   */
  getWarehouses = async (
    cityRef: string,
    warehouseType?: string
  ): Promise<NovaPoshtaWarehouse[]> => {
    try {
      const methodProperties: Record<string, string> = {
        CityRef: cityRef,
      };

      if (warehouseType) {
        methodProperties.TypeOfWarehouseRef = warehouseType;
      }

      const response = await this.makeRequest<NovaPoshtaWarehouse>(
        "Address",
        "getWarehouses",
        methodProperties
      );

      if (response.success) {
        return response.data || [];
      } else {
        console.error("Nova Poshta getWarehouses errors:", response.errors);
        return [];
      }
    } catch (error) {
      console.error("Error getting warehouses:", error);
      return [];
    }
  };

  /**
   * Search for cities with debounce-friendly method
   * @param query - Search query
   * @returns Promise<NovaPoshtaCity[]>
   */
  searchCities = async (query: string): Promise<NovaPoshtaCity[]> => {
    if (!query || query.trim().length < 2) {
      return [];
    }

    return this.getCities(query.trim(), 20);
  };
}

// Export singleton instance
export const novaPoshtaApi = new NovaPoshtaApiService();

// Helper functions for formatting
export const formatCityName = (city: NovaPoshtaCity): string => {
  const cityType = city.SettlementTypeDescription || "";
  if (cityType && cityType !== city.Description) {
    return `${cityType} ${city.Description}, ${city.AreaDescription}`;
  }
  return `${city.Description}, ${city.AreaDescription}`;
};

export const formatWarehouseName = (warehouse: NovaPoshtaWarehouse): string => {
  return `№${warehouse.Number}: ${warehouse.ShortAddress}`;
};

// Cache for better performance
class CacheManager {
  private cache = new Map<string, { data: unknown; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > this.CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  clear(): void {
    this.cache.clear();
  }
}

export const cacheManager = new CacheManager();
