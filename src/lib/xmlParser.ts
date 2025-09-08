/**
 * XML Parser для імпорту товарів з зовнішнього фіду
 */

import { parseString } from "xml2js";

export interface XMLProduct {
  code: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  brand: string;
  category: string;
  quantity_in_stock: number;
  image: string;
}

export interface ParsedProduct {
  external_id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  brand: string;
  category: string;
  quantity: number;
  image_url: string;
  images: string[];
}

/**
 * Парсить XML фід та повертає масив товарів
 */
export async function parseXMLFeed(xmlUrl: string): Promise<ParsedProduct[]> {
  try {
    console.log(`🔄 Fetching XML feed from: ${xmlUrl}`);

    // Отримуємо XML дані
    const response = await fetch(xmlUrl, {
      headers: {
        "User-Agent": "Antiblackout-Product-Importer/1.0",
        Accept: "application/xml, text/xml, */*",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const xmlData = await response.text();
    console.log(
      `✅ XML feed fetched successfully (${xmlData.length} characters)`
    );

    // Парсимо XML
    const parsedData = await parseXMLString(xmlData);

    if (
      !parsedData ||
      !parsedData.price ||
      !parsedData.price.items ||
      !parsedData.price.items.item
    ) {
      throw new Error("Invalid XML structure: items not found");
    }

    const products = Array.isArray(parsedData.price.items.item)
      ? parsedData.price.items.item
      : [parsedData.price.items.item];
    console.log(`📦 Found ${products.length} products in XML feed`);

    // Конвертуємо в наш формат
    const parsedProducts: ParsedProduct[] = products
      .map((product: any) => {
        return convertToParsedProduct(product);
      })
      .filter(Boolean); // Видаляємо null/undefined

    console.log(`✅ Successfully parsed ${parsedProducts.length} products`);
    return parsedProducts;
  } catch (error) {
    console.error("❌ Error parsing XML feed:", error);
    throw error;
  }
}

/**
 * Парсить XML рядок
 */
function parseXMLString(xmlString: string): Promise<any> {
  return new Promise((resolve, reject) => {
    parseString(
      xmlString,
      {
        explicitArray: false,
        mergeAttrs: true,
        trim: true,
      },
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      }
    );
  });
}

/**
 * Конвертує XML товар в наш формат
 */
function convertToParsedProduct(xmlProduct: any): ParsedProduct | null {
  try {
    // Валідація обов'язкових полів
    if (!xmlProduct.id || !xmlProduct.name) {
      console.warn("⚠️ Skipping product: missing required fields (id or name)");
      return null;
    }

    // Парсимо ціну - використовуємо priceuah або prices.price.value
    let price = 0;
    if (xmlProduct.priceuah) {
      price = parseFloat(xmlProduct.priceuah) || 0;
    } else if (
      xmlProduct.prices &&
      xmlProduct.prices.price &&
      xmlProduct.prices.price.value
    ) {
      price = parseFloat(xmlProduct.prices.price.value) || 0;
    }

    // Пропускаємо товари з ціною менше 1
    if (price < 1) {
      console.warn(
        `⚠️ Skipping product ${xmlProduct.id}: price too low (${price})`
      );
      return null;
    }

    // Парсимо кількість
    const quantity = parseInt(xmlProduct.stock_quantity) || 0;
    if (quantity < 0) {
      console.warn(
        `⚠️ Skipping product ${xmlProduct.id}: invalid quantity ${xmlProduct.stock_quantity}`
      );
      return null;
    }

    // Отримуємо всі зображення
    let imageUrls: string[] = [];
    if (xmlProduct.picture) {
      if (Array.isArray(xmlProduct.picture)) {
        imageUrls = xmlProduct.picture.filter(
          (img) => img && img.trim().length > 0
        );
      } else {
        imageUrls = [xmlProduct.picture].filter(
          (img) => img && img.trim().length > 0
        );
      }
    }

    // Пропускаємо товари без зображень
    if (imageUrls.length === 0) {
      console.warn(`⚠️ Skipping product ${xmlProduct.id}: missing images`);
      return null;
    }

    const imageUrl = imageUrls[0]; // Основне зображення

    // Очищаємо та валідуємо дані
    const cleanProduct: ParsedProduct = {
      external_id: String(xmlProduct.id).trim(),
      name: String(xmlProduct.name || "").trim(),
      description: String(xmlProduct.description || "").trim(),
      price: price,
      currency: "UAH", // Жорстко закодовано як UAH
      brand: String(xmlProduct.vendor || "Unknown").trim(),
      category: String(xmlProduct.category || "Uncategorized").trim(),
      quantity: quantity,
      image_url: imageUrl.trim(),
      images: imageUrls.map((img) => img.trim()),
    };

    // Додаткова валідація
    if (cleanProduct.name.length === 0) {
      console.warn(
        `⚠️ Skipping product ${cleanProduct.external_id}: empty name`
      );
      return null;
    }

    if (cleanProduct.external_id.length === 0) {
      console.warn(`⚠️ Skipping product: empty external_id`);
      return null;
    }

    return cleanProduct;
  } catch (error) {
    console.error("❌ Error converting product:", error, xmlProduct);
    return null;
  }
}

/**
 * Валідує масив товарів
 */
export function validateProducts(products: ParsedProduct[]): {
  valid: ParsedProduct[];
  invalid: ParsedProduct[];
  stats: {
    total: number;
    valid: number;
    invalid: number;
    withImages: number;
    withPrice: number;
    inStock: number;
  };
} {
  const valid: ParsedProduct[] = [];
  const invalid: ParsedProduct[] = [];

  products.forEach((product) => {
    if (
      product.external_id &&
      product.name &&
      product.price >= 1 &&
      product.image_url
    ) {
      valid.push(product);
    } else {
      invalid.push(product);
    }
  });

  const stats = {
    total: products.length,
    valid: valid.length,
    invalid: invalid.length,
    withImages: valid.filter((p) => p.image_url && p.image_url.length > 0)
      .length,
    withPrice: valid.filter((p) => p.price > 0).length,
    inStock: valid.filter((p) => p.quantity > 0).length,
  };

  return { valid, invalid, stats };
}
