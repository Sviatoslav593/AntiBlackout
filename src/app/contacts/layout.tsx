import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Контакти | AntiBlackout",
  description:
    "Зв'яжіться з AntiBlackout. Email: antiblackoutsupp@gmail.com, Telegram: @antiblackout_support. Адреса: вул. Івана Франка, 41, м. Львів.",
  keywords:
    "контакти, зв'язок, підтримка, email, telegram, адреса, Львів, AntiBlackout",
  openGraph: {
    title: "Контакти | AntiBlackout",
    description:
      "Зв'яжіться з AntiBlackout. Email: antiblackoutsupp@gmail.com, Telegram: @antiblackout_support. Адреса: вул. Івана Франка, 41, м. Львів.",
    url: "https://anti-blackout.vercel.app/contacts",
    siteName: "AntiBlackout",
    images: [
      {
        url: "https://anti-blackout.vercel.app/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "AntiBlackout - Контакти",
      },
    ],
    locale: "uk_UA",
    type: "website",
  },
};

export default function ContactsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
