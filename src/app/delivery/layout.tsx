import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Доставка | AntiBlackout",
  description:
    "Умови доставки в магазині AntiBlackout. Нова Пошта, кур'єр, самовивіз. Безкоштовна доставка від 2000 грн.",
  keywords:
    "доставка, Нова Пошта, кур'єр, самовивіз, безкоштовна доставка, AntiBlackout",
  openGraph: {
    title: "Доставка | AntiBlackout",
    description:
      "Умови доставки в магазині AntiBlackout. Нова Пошта, кур'єр, самовивіз. Безкоштовна доставка від 2000 грн.",
    url: "https://antiblackout.shop/delivery",
    siteName: "AntiBlackout",
    images: [
      {
        url: "https://antiblackout.shop/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "AntiBlackout - Доставка",
      },
    ],
    locale: "uk_UA",
    type: "website",
  },
};

export default function DeliveryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
