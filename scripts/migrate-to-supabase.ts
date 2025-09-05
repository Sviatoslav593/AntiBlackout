import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

import { ProductService } from "../src/services/products";
import productsData from "../src/data/products.json";

// Script to migrate products from JSON to Supabase
async function migrateProducts() {
  console.log("🚀 Starting products migration to Supabase...");

  try {
    for (const product of productsData) {
      const productData = {
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.inStock ? 10 : 0, // Use inStock to determine stock
        image_url: product.image,
        brand: product.brand,
        capacity: product.capacity?.toString() || "", // Convert to string
      };

      await ProductService.createProduct(productData);
      console.log(`✅ Migrated product: ${product.name}`);
    }

    console.log("🎉 All products migrated successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateProducts();
}

export { migrateProducts };
