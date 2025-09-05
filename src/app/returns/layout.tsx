import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Повернення товару | AntiBlackout",
  description:
    "Умови повернення товарів в магазині AntiBlackout. Повернення протягом 14 днів з момент отримання.",
  keywords:
    "повернення, обмін товару, повернення коштів, умови повернення, AntiBlackout",
  openGraph: {
    title: "Повернення товару | AntiBlackout",
    description:
      "Умови повернення товарів в магазині AntiBlackout. Повернення протягом 14 днів з момент отримання.",
    url: "https://anti-blackout.vercel.app/returns",
    siteName: "AntiBlackout",
    images: [
      {
        url: "https://anti-blackout.vercel.app/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "AntiBlackout - Повернення товару",
      },
    ],
    locale: "uk_UA",
    type: "website",
  },
};

export default function ReturnsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
