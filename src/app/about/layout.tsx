import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Про нас | AntiBlackout",
  description:
    "Дізнайтеся більше про AntiBlackout — український магазин повербанків та зарядних пристроїв, який працює з 2021 року.",
  keywords:
    "AntiBlackout, про нас, український магазин, повербанки, зарядні пристрої, блекаут, енергія",
  openGraph: {
    title: "Про нас | AntiBlackout",
    description:
      "Дізнайтеся більше про AntiBlackout — український магазин повербанків та зарядних пристроїв, який працює з 2021 року.",
    type: "website",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
