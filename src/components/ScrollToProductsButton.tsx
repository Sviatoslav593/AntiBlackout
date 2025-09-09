"use client";

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

export default function ScrollToProductsButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToSection = () => {
    const el = document.getElementById("products");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <button
      onClick={scrollToSection}
      className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ease-in-out
        ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-75 pointer-events-none"}
        bg-blue-600 text-white hover:bg-blue-700 rounded-full p-4 shadow-lg
        hover:shadow-xl transform hover:scale-110 active:scale-95
      `}
      aria-label="Scroll to products"
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}
