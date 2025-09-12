"use client";

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { usePathname } from "next/navigation";

export default function ScrollToProductsButton() {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();

  // Only show on homepage
  const isHomepage = pathname === "/";

  useEffect(() => {
    if (!isHomepage) {
      setIsVisible(false);
      return;
    }

    const toggleVisibility = () => {
      const productsSection = document.getElementById("products");
      if (productsSection) {
        const rect = productsSection.getBoundingClientRect();
        // Show button when scrolled 300px past the top of products section
        // and when user is scrolling down from the products section
        const scrolledPast300px = rect.top < -300;
        const isScrollingDown = window.scrollY > 0;
        setIsVisible(scrolledPast300px && isScrollingDown);
      } else {
        // Fallback: show after scrolling 900px if products section not found
        setIsVisible(window.scrollY > 900);
      }
    };

    // Check initial state
    toggleVisibility();

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, [isHomepage]);

  const scrollToSection = () => {
    const el = document.getElementById("products");
    if (el) {
      // Scroll to the top of products section
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <button
      onClick={scrollToSection}
      className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ease-in-out
        ${
          isVisible
            ? "opacity-100 scale-100"
            : "opacity-0 scale-75 pointer-events-none"
        }
        bg-blue-600 text-white hover:bg-blue-700 rounded-full p-4 shadow-lg
        hover:shadow-xl transform hover:scale-110 active:scale-95
      `}
      aria-label="Повернутись до товарів"
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}
