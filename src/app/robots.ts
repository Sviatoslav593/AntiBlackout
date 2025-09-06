import { MetadataRoute } from "next";
import { generateRobotsTxt } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/", "/cart", "/checkout", "/order-success"],
    },
    sitemap: "https://antiblackout.shop/sitemap.xml",
  };
}
