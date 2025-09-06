import { Metadata } from "next";

// Base site configuration
export const SITE_CONFIG = {
  name: "AntiBlackout",
  description:
    "Енергетичні рішення для надзвичайних ситуацій. Павербанки, зарядні пристрої та аксесуари для забезпечення енергії під час блекаутів.",
  url: "https://antiblackout.shop",
  ogImage: "https://antiblackout.shop/og-image.jpg",
  twitterHandle: "@antiblackout",
  locale: "uk_UA",
  type: "website",
} as const;

// Product interface for SEO
export interface SEOProduct {
  id: string | number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  brand?: string;
  category: string;
  inStock: boolean;
  rating?: number;
  reviewCount?: number;
  capacity?: number;
}

// Generate page title
export function generateTitle(title: string, includeSiteName = true): string {
  if (includeSiteName && !title.includes(SITE_CONFIG.name)) {
    return `${title} | ${SITE_CONFIG.name}`;
  }
  return title;
}

// Generate meta description
export function generateDescription(
  description: string,
  maxLength = 160
): string {
  if (description.length <= maxLength) {
    return description;
  }
  return description.substring(0, maxLength - 3) + "...";
}

// Generate product-specific metadata
export function generateProductMetadata(product: SEOProduct): Metadata {
  const title = generateTitle(product.name);
  const description = generateDescription(
    `${product.description} Купити ${
      product.name
    } за ${product.price.toLocaleString()} ₴. ${
      product.brand ? `Бренд: ${product.brand}.` : ""
    } ${
      product.capacity ? `Ємність: ${product.capacity}мАг.` : ""
    } Швидка доставка по Україні.`
  );

  const productUrl = `${SITE_CONFIG.url}/product/${product.id}`;
  const productImage = product.image.startsWith("http")
    ? product.image
    : `${SITE_CONFIG.url}${product.image}`;

  return {
    title,
    description,
    keywords: [
      product.name,
      product.brand || "",
      "павербанк",
      "зарядний пристрій",
      "енергія",
      "блекаут",
      "купити",
      "онлайн магазин",
      "Україна",
    ]
      .filter(Boolean)
      .join(", "),

    openGraph: {
      title,
      description,
      url: productUrl,
      siteName: SITE_CONFIG.name,
      images: [
        {
          url: productImage,
          width: 800,
          height: 600,
          alt: product.name,
        },
        {
          url: SITE_CONFIG.ogImage,
          width: 1200,
          height: 630,
          alt: SITE_CONFIG.name,
        },
      ],
      locale: SITE_CONFIG.locale,
      type: "product",
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [productImage],
      creator: SITE_CONFIG.twitterHandle,
    },

    alternates: {
      canonical: productUrl,
    },
  };
}

// Generate category metadata
export function generateCategoryMetadata(
  category: string,
  productCount: number
): Metadata {
  const categoryNames: Record<string, string> = {
    powerbank: "Павербанки",
    charger: "Зарядні пристрої",
    accessories: "Аксесуари",
    cables: "Кабелі",
  };

  const categoryName = categoryNames[category] || category;
  const title = generateTitle(`${categoryName} - Купити онлайн`);
  const description = generateDescription(
    `Широкий вибір ${categoryName.toLowerCase()} в магазині ${
      SITE_CONFIG.name
    }. ${productCount} товарів. Якісні енергетичні рішення для надзвичайних ситуацій. Швидка доставка по Україні.`
  );

  return {
    title,
    description,
    keywords: [
      categoryName,
      "купити",
      "онлайн магазин",
      "енергія",
      "блекаут",
      "Україна",
      "доставка",
    ].join(", "),

    openGraph: {
      title,
      description,
      url: `${SITE_CONFIG.url}/category/${category}`,
      siteName: SITE_CONFIG.name,
      images: [SITE_CONFIG.ogImage],
      locale: SITE_CONFIG.locale,
      type: "website",
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [SITE_CONFIG.ogImage],
    },
  };
}

// Generate cart page metadata
export function generateCartMetadata(): Metadata {
  const title = generateTitle("Кошик");
  const description = generateDescription(
    "Ваш кошик покупок в магазині AntiBlackout. Переглядайте вибрані товари та оформлюйте замовлення."
  );

  return {
    title,
    description,
    robots: {
      index: false, // Don't index cart page
      follow: true,
    },
    openGraph: {
      title,
      description,
      url: `${SITE_CONFIG.url}/cart`,
      siteName: SITE_CONFIG.name,
      images: [SITE_CONFIG.ogImage],
      locale: SITE_CONFIG.locale,
      type: "website",
    },
  };
}

// Generate JSON-LD structured data for product
export function generateProductStructuredData(product: SEOProduct) {
  const productUrl = `${SITE_CONFIG.url}/product/${product.id}`;
  const productImage = product.image.startsWith("http")
    ? product.image
    : `${SITE_CONFIG.url}${product.image}`;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: productImage,
    brand: {
      "@type": "Brand",
      name: product.brand || SITE_CONFIG.name,
    },
    category: product.category,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "UAH",
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: productUrl,
      seller: {
        "@type": "Organization",
        name: SITE_CONFIG.name,
        url: SITE_CONFIG.url,
      },
    },
    aggregateRating:
      product.rating && product.reviewCount
        ? {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.reviewCount,
          }
        : undefined,
    additionalProperty: product.capacity
      ? [
          {
            "@type": "PropertyValue",
            name: "Ємність",
            value: `${product.capacity}мАг`,
          },
        ]
      : undefined,
  };
}

// Generate JSON-LD structured data for organization
export function generateOrganizationStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    url: SITE_CONFIG.url,
    logo: `${SITE_CONFIG.url}/logo.png`,
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+380-XX-XXX-XXXX", // Replace with actual phone
      contactType: "customer service",
      areaServed: "UA",
      availableLanguage: "Ukrainian",
    },
    address: {
      "@type": "PostalAddress",
      addressCountry: "UA",
    },
    sameAs: [
      // Add your social media URLs here
      // "https://facebook.com/antiblackout",
      // "https://instagram.com/antiblackout",
    ],
  };
}

// Generate JSON-LD structured data for breadcrumbs
export function generateBreadcrumbStructuredData(
  items: Array<{ name: string; url: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// Generate sitemap data
export function generateSitemapData(
  products: SEOProduct[],
  staticPages: string[] = []
) {
  const baseUrl = SITE_CONFIG.url;
  const currentDate = new Date().toISOString();

  const staticUrls = staticPages.map((page) => ({
    url: `${baseUrl}${page}`,
    lastModified: currentDate,
    changeFrequency: "monthly" as const,
    priority: page === "/" ? 1.0 : 0.8,
  }));

  const productUrls = products.map((product) => ({
    url: `${baseUrl}/product/${product.id}`,
    lastModified: currentDate,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  return [...staticUrls, ...productUrls];
}

// Generate robots.txt content
export function generateRobotsTxt() {
  return `User-agent: *
Allow: /

# Sitemap
Sitemap: ${SITE_CONFIG.url}/sitemap.xml

# Disallow admin and private areas
Disallow: /admin/
Disallow: /api/
Disallow: /cart
Disallow: /checkout
Disallow: /order-success

# Allow important pages
Allow: /
Allow: /product/
Allow: /category/
Allow: /about
Allow: /delivery
Allow: /warranty
Allow: /returns
Allow: /contacts
Allow: /faq`;
}

// Utility to format price for structured data
export function formatPrice(price: number): string {
  return price.toLocaleString("uk-UA");
}

// Utility to generate canonical URL
export function generateCanonicalUrl(path: string): string {
  return `${SITE_CONFIG.url}${path}`;
}

// Utility to generate image URL
export function generateImageUrl(imagePath: string): string {
  if (imagePath.startsWith("http")) {
    return imagePath;
  }
  return `${SITE_CONFIG.url}${imagePath}`;
}
