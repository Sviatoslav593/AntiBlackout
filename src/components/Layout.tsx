import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import ScrollToProductsButton from "./ScrollToProductsButton";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-16">{children}</main>
      <Footer />
      <ScrollToProductsButton />
    </div>
  );
}
