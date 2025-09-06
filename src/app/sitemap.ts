import { MetadataRoute } from "next";
import { generateSitemapData, SITE_CONFIG } from "@/lib/seo";
import products from "@/data/products.json";

export default function sitemap(): MetadataRoute.Sitemap {
  // Convert products to SEO format
  const seoProducts = products.map((product) => ({
    id: product.id.toString(),
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
  }));

  // Static pages
  const staticPages = [
    "/",
    "/about",
    "/delivery",
    "/warranty",
    "/returns",
    "/contacts",
    "/faq",
    "/cart",
    "/favorites",
  ];

  return generateSitemapData(seoProducts, staticPages);
}
