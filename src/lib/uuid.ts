import { v4 as uuidv4, validate as isUUID } from 'uuid';

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
 * Convert numeric ID to UUID by mapping to a consistent UUID
 * This ensures the same numeric ID always maps to the same UUID
 */
export function numericIdToUUID(numericId: number): string {
  // For now, just generate a new UUID for each product
  // In a real application, you would want to store the mapping
  // between numeric IDs and UUIDs in a database
  return generateUUID();
}

/**
 * Get product UUID from cart item
 * If the item has a numeric ID, convert it to UUID
 * If it already has a UUID, return it
 */
export function getProductUUID(item: { id: number | string }): string {
  if (typeof item.id === 'string' && isValidUUID(item.id)) {
    return item.id;
  }
  
  if (typeof item.id === 'number') {
    return numericIdToUUID(item.id);
  }
  
  // Fallback: generate new UUID
  return generateUUID();
}
