import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Часті питання | AntiBlackout",
  description:
    "Відповіді на часті питання про замовлення, оплату, доставку та гарантії в магазині AntiBlackout.",
  keywords:
    "FAQ, часті питання, замовлення, оплата, доставка, гарантії, повернення, AntiBlackout",
  openGraph: {
    title: "Часті питання | AntiBlackout",
    description:
      "Відповіді на часті питання про замовлення, оплату, доставку та гарантії в магазині AntiBlackout.",
    url: "https://antiblackout.shop/faq",
    siteName: "AntiBlackout",
    images: [
      {
        url: "https://antiblackout.shop/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "AntiBlackout - Часті питання",
      },
    ],
    locale: "uk_UA",
    type: "website",
  },
};

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
