import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import ScrollToProductsButton from "./ScrollToProductsButton";
import { FilterProvider } from "@/context/FilterContext";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <FilterProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-16">{children}</main>
        <Footer />
        <ScrollToProductsButton />
      </div>
    </FilterProvider>
  );
}
