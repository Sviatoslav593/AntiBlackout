import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Product ID mapping: original numeric ID -> database UUID
const productIdMapping: Record<number, string> = {
  1: "767a5cc7-f8dc-41c2-b1b6-9a6af980fd0c",
  2: "6fb9bdf6-b788-4f38-9faf-89c1b08c55c9",
  3: "f783f4d4-3a83-4abe-84c7-7e6ca7b64c75",
  4: "9def87ff-0ff3-427c-b3ee-eaff255c5637",
  5: "560771d2-eebb-4890-824c-7a76dba08c64",
  6: "6faaa8e4-dd64-41cd-9fcb-8db7f8a8944d",
  7: "ff5cbb46-bf57-47e3-8a20-bc6f65d0f949",
  8: "25b4c2a1-64cf-45fd-8cc0-3d28d4a68c2c",
  9: "497c46d1-300a-4eb3-9cf5-bff4f3e337a7",
  10: "33e8d142-6f84-4841-8315-9afa846b01a9",
};

/**
 * Get database UUID for a product by its original numeric ID
 */
export function getProductDatabaseId(originalId: number): string | null {
  return productIdMapping[originalId] || null;
}

/**
 * Get all product mappings
 */
export function getAllProductMappings(): Record<number, string> {
  return { ...productIdMapping };
}

/**
 * Validate that a product exists in the database
 */
export async function validateProductExists(
  productId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabaseAdmin
      .from("products")
      .select("id")
      .eq("id", productId)
      .single();

    return !error && !!data;
  } catch (error) {
    console.error("Error validating product:", error);
    return false;
  }
}

/**
 * Get product database ID and validate it exists
 */
export async function getValidatedProductId(
  originalId: number
): Promise<string | null> {
  const databaseId = getProductDatabaseId(originalId);

  if (!databaseId) {
    console.error(
      `❌ No database ID found for original product ID: ${originalId}`
    );
    return null;
  }

  const exists = await validateProductExists(databaseId);

  if (!exists) {
    console.error(
      `❌ Product with database ID ${databaseId} does not exist in database`
    );
    return null;
  }

  return databaseId;
}
