import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/utils/supabase/server";
import { parseStringPromise } from "xml2js";

interface XmlProduct {
  $: { id: string };
  url?: string[];
  name: string[];
  description?: string[];
  priceuah: string[];
  picture?: string[];
  vendor?: string[];
  vendorCode?: string[];
  stock_quantity?: string[];
  categoryId: string[];
  param?: Array<{
    $: { name: string };
    _: string;
  }>;
}

interface XmlFeed {
  shop: {
    items: Array<{
      item: XmlProduct[];
    }>;
  };
}

interface ProcessedProduct {
  external_id: string;
  name: string;
  description: string;
  price: number;
  brand: string;
  image_url: string;
  images: string[];
  vendor_code: string;
  quantity: number;
  category_id: number;
  characteristics: Record<string, any>;
}

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 Starting XML import process...");
    const supabase = createServerClient();

    // 1. Fetch and parse XML feed
    console.log("📥 Fetching XML feed...");
    const response = await fetch("https://mma.in.ua/feed/xml/iDxAyRECF.xml", {
      redirect: "follow",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch XML feed: ${response.statusText}`);
    }

    const xmlText = await response.text();
    console.log(`📊 XML feed size: ${xmlText.length} characters`);

    console.log("🔍 Parsing XML...");
    const xmlData: XmlFeed = await parseStringPromise(xmlText);
    const offers = xmlData.shop.items[0].item;
    console.log(`📦 Found ${offers.length} products in XML`);

    // 2. Ensure categories exist
    console.log("🏗️ Ensuring categories exist...");
    const { error: categoriesError } = await supabase.from("categories").upsert(
      [
        { id: 1001, name: "Портативні батареї" },
        { id: 1002, name: "Зарядки та кабелі" },
      ],
      { onConflict: "id" }
    );

    if (categoriesError) {
      console.error("Error upserting categories:", categoriesError);
      throw categoriesError;
    }
    console.log("✅ Categories ensured");

    // 3. Process products from XML
    console.log("📥 Processing products...");
    const processedProducts: ProcessedProduct[] = [];
    const xmlExternalIds = new Set<string>();

    for (const offer of offers) {
      try {
        const externalId = offer.$.id;
        xmlExternalIds.add(externalId);

        const categoryId = parseInt(offer.categoryId[0]);

        // Map to normalized categories
        let normalizedCategoryId: number;
        if (categoryId === 1 || categoryId === 3) {
          normalizedCategoryId = 1001; // Портативні батареї
        } else if (categoryId === 14 || categoryId === 16) {
          normalizedCategoryId = 1002; // Зарядки та кабелі
        } else {
          console.warn(
            `Unknown category ID: ${categoryId}, skipping product ${externalId}`
          );
          continue;
        }

        // Parse and normalize characteristics from params
        const characteristics: Record<string, any> = {};
        const normalizeConnector = (raw: string): string => {
          const v = raw.trim().toLowerCase().replace(/\s+/g, " ");
          // Canonicalize common connector names
          if (/(type\s*-?\s*c|usb-c|usb c)/i.test(raw)) return "Type-C";
          if (/(usb\s*-?\s*a|usb a)/i.test(raw)) return "USB-A";
          if (/(micro\s*-?\s*usb|usb\s*micro)/i.test(raw)) return "Micro-USB";
          if (/lightning/i.test(raw)) return "Lightning";
          if (/mini\s*-?\s*usb/i.test(raw)) return "Mini-USB";
          // Fallback: Title Case
          return v
            .split(" ")
            .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
            .join(" ");
        };

        const normalizeCapacity = (raw: string): number | null => {
          const match = String(raw).match(/(\d+[\d\s\.,]*)/);
          if (!match) return null;
          const num = match[1].replace(/\s+/g, "").replace(/,/g, ".");
          const parsed = parseFloat(num);
          if (Number.isNaN(parsed)) return null;
          return Math.round(parsed); // store as integer mAh
        };

        const normalizeLengthMeters = (raw: string): number | null => {
          const match = String(raw).match(/(\d+(?:[\.,]\d+)?)/);
          if (!match) return null;
          const num = match[1].replace(/,/g, ".");
          const parsed = parseFloat(num);
          return Number.isNaN(parsed) ? null : parsed;
        };

        const setCharacteristic = (key: string, value: any) => {
          if (characteristics[key] !== undefined) {
            if (Array.isArray(characteristics[key])) {
              characteristics[key].push(value);
            } else {
              characteristics[key] = [characteristics[key], value];
            }
          } else {
            characteristics[key] = value;
          }
        };

        if (offer.param) {
          offer.param.forEach((param) => {
            if (param.$ && param.$.name && param._) {
              const originalName = param.$.name.trim();
              const rawValue = param._.trim();
              const nameLower = originalName.toLowerCase();

              // Normalize capacity (store numeric mAh under canonical key)
              if (nameLower.includes("ємн") && nameLower.includes("mah")) {
                const cap = normalizeCapacity(rawValue);
                if (cap !== null) {
                  setCharacteristic("Ємність акумулятора, mah", cap);
                }
                return;
              }

              // Normalize cable length (meters as number)
              if (
                nameLower.includes("довж") &&
                nameLower.includes("каб") &&
                nameLower.includes("м")
              ) {
                const meters = normalizeLengthMeters(rawValue);
                if (meters !== null) {
                  setCharacteristic("Довжина кабелю, м", meters);
                }
                return;
              }

              // Normalize connectors
              if (
                nameLower.includes("вхід") &&
                nameLower.includes("коннектор")
              ) {
                setCharacteristic(
                  "Вхід (Тип коннектора)",
                  normalizeConnector(rawValue)
                );
                return;
              }
              if (
                nameLower.includes("вихід") &&
                nameLower.includes("коннектор")
              ) {
                setCharacteristic(
                  "Вихід (Тип коннектора)",
                  normalizeConnector(rawValue)
                );
                return;
              }

              // Default: store as-is
              setCharacteristic(originalName, rawValue);
            }
          });
        }

        const productName = offer.name[0];
        const brand = offer.vendor?.[0] || "Unknown";
        const vendorCode = offer.vendorCode?.[0] || "";
        const price = parseFloat(offer.priceuah[0]);
        const quantity = parseInt(offer.stock_quantity?.[0] || "0");
        const pictures = offer.picture || [];
        const imageUrl = pictures[0] || "";

        // Filter out products without images, out of stock, or price < 1
        if (!imageUrl || imageUrl.trim() === "") {
          console.log(`Skipping product ${externalId}: No image`);
          continue;
        }

        if (quantity <= 0) {
          console.log(
            `Skipping product ${externalId}: Out of stock (quantity: ${quantity})`
          );
          continue;
        }

        if (price < 1) {
          console.log(
            `Skipping product ${externalId}: Price too low (${price})`
          );
          continue;
        }

        const product: ProcessedProduct = {
          external_id: externalId,
          name: productName,
          description: offer.description?.[0] || "",
          price: price,
          brand: brand,
          image_url: imageUrl,
          images: pictures,
          vendor_code: vendorCode,
          quantity: quantity,
          category_id: normalizedCategoryId,
          characteristics: characteristics,
        };

        processedProducts.push(product);
      } catch (error) {
        console.error(`Error processing product ${offer.$.id}:`, error);
        continue;
      }
    }

    console.log(`📦 Processed ${processedProducts.length} valid products`);

    // 4. Get existing products from database
    console.log("🔍 Fetching existing products...");
    const { data: existingProducts, error: fetchError } = await supabase
      .from("products")
      .select("external_id, id");

    if (fetchError) {
      console.error("Error fetching existing products:", fetchError);
      throw fetchError;
    }

    const existingExternalIds = new Set(
      existingProducts?.map((p) => p.external_id) || []
    );
    console.log(`📊 Found ${existingProducts?.length || 0} existing products`);

    // 5. Separate products into updates and inserts
    const productsToUpdate: Array<ProcessedProduct & { id?: string }> = [];
    const productsToInsert: ProcessedProduct[] = [];

    for (const product of processedProducts) {
      if (existingExternalIds.has(product.external_id)) {
        // Find the database ID for this product
        const existingProduct = existingProducts?.find(
          (p) => p.external_id === product.external_id
        );
        productsToUpdate.push({ ...product, id: existingProduct?.id });
      } else {
        productsToInsert.push(product);
      }
    }

    console.log(`📝 Products to update: ${productsToUpdate.length}`);
    console.log(`➕ Products to insert: ${productsToInsert.length}`);

    // 6. Insert new products in batches
    let insertedCount = 0;
    if (productsToInsert.length > 0) {
      console.log("💾 Inserting new products...");
      const batchSize = 100;

      for (let i = 0; i < productsToInsert.length; i += batchSize) {
        const batch = productsToInsert.slice(i, i + batchSize);

        const { error: insertError } = await supabase
          .from("products")
          .insert(batch);

        if (insertError) {
          console.error(
            `Error inserting batch ${Math.floor(i / batchSize) + 1}:`,
            insertError
          );
          throw insertError;
        }

        insertedCount += batch.length;
        console.log(
          `✅ Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
            productsToInsert.length / batchSize
          )} (${insertedCount}/${productsToInsert.length})`
        );
      }
    }

    // 7. Update existing products in batches
    let updatedCount = 0;
    if (productsToUpdate.length > 0) {
      console.log("🔄 Updating existing products...");

      for (const product of productsToUpdate) {
        const { id, ...updateData } = product;

        const { error: updateError } = await supabase
          .from("products")
          .update({
            ...updateData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id);

        if (updateError) {
          console.error(
            `Error updating product ${product.external_id}:`,
            updateError
          );
          // Continue with other products instead of failing completely
          continue;
        }

        updatedCount++;

        // Log progress every 50 updates
        if (updatedCount % 50 === 0) {
          console.log(
            `🔄 Updated ${updatedCount}/${productsToUpdate.length} products`
          );
        }
      }
    }

    // 8. Remove products not in current XML feed
    console.log("🗑️ Removing products not in XML feed...");
    const xmlExternalIdsArray = Array.from(xmlExternalIds);

    const { data: productsToDelete, error: deleteSelectError } = await supabase
      .from("products")
      .select("external_id")
      .not(
        "external_id",
        "in",
        `(${xmlExternalIdsArray.map((id) => `"${id}"`).join(",")})`
      );

    if (deleteSelectError) {
      console.error("Error selecting products to delete:", deleteSelectError);
      throw deleteSelectError;
    }

    let deletedCount = 0;
    if (productsToDelete && productsToDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from("products")
        .delete()
        .not(
          "external_id",
          "in",
          `(${xmlExternalIdsArray.map((id) => `"${id}"`).join(",")})`
        );

      if (deleteError) {
        console.error("Error deleting products:", deleteError);
        throw deleteError;
      }

      deletedCount = productsToDelete.length;
      console.log(`🗑️ Deleted ${deletedCount} products not in XML feed`);
    }

    // 9. Final verification
    const { data: finalProducts, error: finalCountError } = await supabase
      .from("products")
      .select("id", { count: "exact" });

    if (finalCountError) {
      console.error("Error getting final product count:", finalCountError);
    }

    const finalCount = finalProducts?.length || 0;
    console.log(`📊 Final product count: ${finalCount}`);

    console.log("🎉 Import completed successfully!");

    return NextResponse.json({
      success: true,
      message: "XML import completed successfully",
      stats: {
        xmlProducts: offers.length,
        validProducts: processedProducts.length,
        inserted: insertedCount,
        updated: updatedCount,
        deleted: deletedCount,
        finalCount: finalCount,
      },
    });
  } catch (error) {
    console.error("Import error:", error);
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack trace"
    );
    return NextResponse.json(
      {
        success: false,
        error: "Import failed",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : "No stack trace",
      },
      { status: 500 }
    );
  }
}
