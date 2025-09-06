import { Metadata } from "next";
import {
  generateProductMetadata,
  generateProductStructuredData,
  generateBreadcrumbStructuredData,
  SEOProduct,
} from "@/lib/seo";
import products from "@/data/products.json";

// Convert JSON product to SEOProduct format
function convertToSEOProduct(product: any): SEOProduct {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    originalPrice: product.originalPrice,
    image: product.image,
    brand: product.brand,
    category: product.category,
    inStock: product.inStock,
    rating: product.rating,
    reviewCount: product.reviewCount,
    capacity: product.capacity,
  };
}

// Generate metadata for product page
export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const productId = parseInt(params.id);
  const product = products.find((p) => p.id === productId);

  if (!product) {
    return {
      title: "Товар не знайдено",
      description: "Запитаний товар не знайдено в нашому магазині.",
    };
  }

  const seoProduct = convertToSEOProduct(product);
  return generateProductMetadata(seoProduct);
}

// Generate structured data for product page
export function generateStructuredData(productId: string) {
  const product = products.find((p) => p.id === parseInt(productId));

  if (!product) {
    return null;
  }

  const seoProduct = convertToSEOProduct(product);

  // Generate breadcrumb data
  const breadcrumbs = [
    { name: "Головна", url: "https://anti-blackout.vercel.app" },
    { name: "Товари", url: "https://anti-blackout.vercel.app/#products" },
    {
      name: seoProduct.name,
      url: `https://anti-blackout.vercel.app/product/${seoProduct.id}`,
    },
  ];

  return {
    product: generateProductStructuredData(seoProduct),
    breadcrumbs: generateBreadcrumbStructuredData(breadcrumbs),
  };
}
