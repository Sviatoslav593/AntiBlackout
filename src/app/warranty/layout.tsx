import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Гарантія | AntiBlackout",
  description:
    "Гарантійні умови на товари AntiBlackout. Офіційна гарантія від виробника від 6 до 12 місяців.",
  keywords:
    "гарантія, гарантійне обслуговування, виробнича гарантія, повербанки, AntiBlackout",
  openGraph: {
    title: "Гарантія | AntiBlackout",
    description:
      "Гарантійні умови на товари AntiBlackout. Офіційна гарантія від виробника від 6 до 12 місяців.",
    url: "https://antiblackout.shop/warranty",
    siteName: "AntiBlackout",
    images: [
      {
        url: "https://antiblackout.shop/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "AntiBlackout - Гарантія",
      },
    ],
    locale: "uk_UA",
    type: "website",
  },
};

export default function WarrantyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
