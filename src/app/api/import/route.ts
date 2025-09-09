import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/client";
import { parseStringPromise } from "xml2js";

interface XmlProduct {
  id: string[];
  name: string[];
  description?: string[];
  priceuah: string[];
  image?: string[];
  vendorCode?: string[];
  quantity?: string[];
  categoryId: string[];
  param?: Array<{
    $: { name: string };
    _: string;
  }>;
}

interface XmlFeed {
  yml_catalog: {
    shop: Array<{
      offers: Array<{
        offer: XmlProduct[];
      }>;
    }>;
  };
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    console.log("🚀 Starting import process...");

    // 1. Fetch XML feed
    console.log("📥 Fetching XML feed...");
    const response = await fetch("https://mma.in.ua/feed/xml/iDxAyRECF.xml");
    if (!response.ok) {
      throw new Error(`Failed to fetch XML feed: ${response.statusText}`);
    }
    
    const xmlText = await response.text();
    console.log(`📊 XML feed size: ${xmlText.length} characters`);

    // 2. Parse XML
    console.log("🔍 Parsing XML...");
    const xmlData: XmlFeed = await parseStringPromise(xmlText);
    const offers = xmlData.yml_catalog.shop[0].offers[0].offer;
    console.log(`📦 Found ${offers.length} products in XML`);

    // 3. Clean up old data
    console.log("🧹 Cleaning up old data...");
    
    // Delete all products
    const { error: deleteProductsError } = await supabase
      .from("products")
      .delete()
      .neq("id", 0); // Delete all products
    
    if (deleteProductsError) {
      console.error("Error deleting products:", deleteProductsError);
      throw deleteProductsError;
    }
    console.log("✅ Deleted all old products");

    // Delete all categories
    const { error: deleteCategoriesError } = await supabase
      .from("categories")
      .delete()
      .neq("id", 0); // Delete all categories
    
    if (deleteCategoriesError) {
      console.error("Error deleting categories:", deleteCategoriesError);
      throw deleteCategoriesError;
    }
    console.log("✅ Deleted all old categories");

    // 4. Create normalized categories
    console.log("🏗️ Creating normalized categories...");
    const normalizedCategories = [
      { id: 1001, name: "Портативні батареї" },
      { id: 1002, name: "Зарядки та кабелі" }
    ];

    const { error: categoriesError } = await supabase
      .from("categories")
      .insert(normalizedCategories);

    if (categoriesError) {
      console.error("Error creating categories:", categoriesError);
      throw categoriesError;
    }
    console.log("✅ Created normalized categories");

    // 5. Process and import products
    console.log("📥 Processing products...");
    const productsToInsert = [];
    
    for (const offer of offers) {
      try {
        const categoryId = parseInt(offer.categoryId[0]);
        
        // Map to normalized categories
        let normalizedCategoryId: number;
        if (categoryId === 1 || categoryId === 3) {
          normalizedCategoryId = 1001; // Портативні батареї
        } else if (categoryId === 14 || categoryId === 16) {
          normalizedCategoryId = 1002; // Зарядки та кабелі
        } else {
          console.warn(`Unknown category ID: ${categoryId}, skipping product ${offer.id[0]}`);
          continue;
        }

        // Parse characteristics from params
        const characteristics: Record<string, any> = {};
        if (offer.param) {
          offer.param.forEach(param => {
            if (param.$ && param.$.name && param._) {
              const name = param.$.name;
              const value = param._;
              
              // Handle multiple values for the same characteristic
              if (characteristics[name]) {
                if (Array.isArray(characteristics[name])) {
                  characteristics[name].push(value);
                } else {
                  characteristics[name] = [characteristics[name], value];
                }
              } else {
                characteristics[name] = value;
              }
            }
          });
        }

        // Extract brand from name or vendorCode
        const productName = offer.name[0];
        const vendorCode = offer.vendorCode?.[0] || "";
        let brand = "Unknown";
        
        // Try to extract brand from product name
        const brandPatterns = [
          /^([A-Za-zА-Яа-я]+)\s/,
          /([A-Za-zА-Яа-я]+)/
        ];
        
        for (const pattern of brandPatterns) {
          const match = productName.match(pattern);
          if (match) {
            brand = match[1];
            break;
          }
        }

        const product = {
          external_id: offer.id[0],
          name: productName,
          description: offer.description?.[0] || "",
          price: parseFloat(offer.priceuah[0]),
          brand: brand,
          image_url: offer.image?.[0] || "",
          images: offer.image ? [offer.image[0]] : [],
          vendor_code: vendorCode,
          quantity: parseInt(offer.quantity?.[0] || "0"),
          category_id: normalizedCategoryId,
          characteristics: characteristics
        };

        productsToInsert.push(product);
      } catch (error) {
        console.error(`Error processing product ${offer.id?.[0]}:`, error);
        continue;
      }
    }

    console.log(`📦 Processed ${productsToInsert.length} products`);

    // 6. Insert products in batches
    console.log("💾 Inserting products...");
    const batchSize = 100;
    let insertedCount = 0;
    
    for (let i = 0; i < productsToInsert.length; i += batchSize) {
      const batch = productsToInsert.slice(i, i + batchSize);
      
      const { error: insertError } = await supabase
        .from("products")
        .insert(batch);
      
      if (insertError) {
        console.error(`Error inserting batch ${i / batchSize + 1}:`, insertError);
        throw insertError;
      }
      
      insertedCount += batch.length;
      console.log(`✅ Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(productsToInsert.length / batchSize)} (${insertedCount}/${productsToInsert.length})`);
    }

    console.log("🎉 Import completed successfully!");

    return NextResponse.json({
      success: true,
      message: "Import completed successfully",
      stats: {
        totalProducts: offers.length,
        processedProducts: productsToInsert.length,
        insertedProducts: insertedCount,
        categoriesCreated: normalizedCategories.length
      }
    });

  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Import failed", 
        details: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}
