/**
 * XML Parser для імпорту товарів з зовнішнього фіду
 */

import { parseString } from 'xml2js';

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
        'User-Agent': 'Antiblackout-Product-Importer/1.0',
        'Accept': 'application/xml, text/xml, */*',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const xmlData = await response.text();
    console.log(`✅ XML feed fetched successfully (${xmlData.length} characters)`);

    // Парсимо XML
    const parsedData = await parseXMLString(xmlData);
    
    if (!parsedData || !parsedData.products || !Array.isArray(parsedData.products.product)) {
      throw new Error('Invalid XML structure: products not found');
    }

    const products = parsedData.products.product;
    console.log(`📦 Found ${products.length} products in XML feed`);

    // Конвертуємо в наш формат
    const parsedProducts: ParsedProduct[] = products.map((product: any) => {
      return convertToParsedProduct(product);
    }).filter(Boolean); // Видаляємо null/undefined

    console.log(`✅ Successfully parsed ${parsedProducts.length} products`);
    return parsedProducts;

  } catch (error) {
    console.error('❌ Error parsing XML feed:', error);
    throw error;
  }
}

/**
 * Парсить XML рядок
 */
function parseXMLString(xmlString: string): Promise<any> {
  return new Promise((resolve, reject) => {
    parseString(xmlString, {
      explicitArray: false,
      mergeAttrs: true,
      trim: true,
    }, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

/**
 * Конвертує XML товар в наш формат
 */
function convertToParsedProduct(xmlProduct: any): ParsedProduct | null {
  try {
    // Валідація обов'язкових полів
    if (!xmlProduct.code || !xmlProduct.name) {
      console.warn('⚠️ Skipping product: missing required fields (code or name)');
      return null;
    }

    // Парсимо ціну
    const price = parseFloat(xmlProduct.price) || 0;
    if (price < 0) {
      console.warn(`⚠️ Skipping product ${xmlProduct.code}: invalid price ${xmlProduct.price}`);
      return null;
    }

    // Парсимо кількість
    const quantity = parseInt(xmlProduct.quantity_in_stock) || 0;
    if (quantity < 0) {
      console.warn(`⚠️ Skipping product ${xmlProduct.code}: invalid quantity ${xmlProduct.quantity_in_stock}`);
      return null;
    }

    // Очищаємо та валідуємо дані
    const cleanProduct: ParsedProduct = {
      external_id: String(xmlProduct.code).trim(),
      name: String(xmlProduct.name || '').trim(),
      description: String(xmlProduct.description || '').trim(),
      price: price,
      currency: 'UAH', // Жорстко закодовано як UAH
      brand: String(xmlProduct.brand || 'Unknown').trim(),
      category: String(xmlProduct.category || 'Uncategorized').trim(),
      quantity: quantity,
      image_url: String(xmlProduct.image || '').trim(),
    };

    // Додаткова валідація
    if (cleanProduct.name.length === 0) {
      console.warn(`⚠️ Skipping product ${cleanProduct.external_id}: empty name`);
      return null;
    }

    if (cleanProduct.external_id.length === 0) {
      console.warn(`⚠️ Skipping product: empty external_id`);
      return null;
    }

    return cleanProduct;

  } catch (error) {
    console.error('❌ Error converting product:', error, xmlProduct);
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

  products.forEach(product => {
    if (product.external_id && product.name && product.price >= 0) {
      valid.push(product);
    } else {
      invalid.push(product);
    }
  });

  const stats = {
    total: products.length,
    valid: valid.length,
    invalid: invalid.length,
    withImages: valid.filter(p => p.image_url && p.image_url.length > 0).length,
    withPrice: valid.filter(p => p.price > 0).length,
    inStock: valid.filter(p => p.quantity > 0).length,
  };

  return { valid, invalid, stats };
}
