import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AntiBlackout - Енергетичні Рішення для Надзвичайних Ситуацій",
  description:
    "Купуйте павербанки, зарядні пристрої та аксесуари, щоб залишатися на зв'язку під час блекаутів. Надійні енергетичні рішення для надзвичайних ситуацій та повсякденного використання.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
