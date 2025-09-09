import { ReactNode } from "react";
import HeaderWithCategories from "./HeaderWithCategories";
import Footer from "./Footer";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <HeaderWithCategories />
      <main className="flex-1" style={{ paddingTop: "64px" }}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
