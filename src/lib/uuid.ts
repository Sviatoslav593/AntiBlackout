import { v4 as uuidv4, validate as isUUID } from "uuid";
import { getProductDatabaseId } from "@/services/productMapping";

/**
 * Generate a UUID v4
 */
export function generateUUID(): string {
  return uuidv4();
}

/**
 * Validate if a string is a valid UUID
 */
export function isValidUUID(uuid: string): boolean {
  return isUUID(uuid);
}

/**
 * Convert numeric ID to database UUID using product mapping
 * This ensures the same numeric ID always maps to the same database UUID
 */
export function numericIdToUUID(numericId: number): string {
  const databaseId = getProductDatabaseId(numericId);
  
  if (databaseId) {
    return databaseId;
  }
  
  // Fallback: generate new UUID if no mapping found
  console.warn(`⚠️ No database mapping found for product ID ${numericId}, generating new UUID`);
  return generateUUID();
}

/**
 * Get product UUID from cart item
 * If the item has a numeric ID, convert it to database UUID
 * If it already has a UUID, return it
 */
export function getProductUUID(item: { id: number | string }): string {
  if (typeof item.id === "string" && isValidUUID(item.id)) {
    return item.id;
  }

  if (typeof item.id === "number") {
    return numericIdToUUID(item.id);
  }

  // Fallback: generate new UUID
  return generateUUID();
}
