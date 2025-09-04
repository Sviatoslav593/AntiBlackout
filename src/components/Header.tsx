"use client";

import Link from "next/link";
import { ShoppingCart, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigation = [
    { name: "Головна", href: "/" },
    { name: "Товари", href: "#products" },
    { name: "Про нас", href: "#about" },
    { name: "Контакти", href: "#contact" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 cursor-pointer">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold">
              AB
            </div>
            <span className="text-xl font-bold text-foreground">
              AntiBlackout
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Cart Icon & Mobile Menu Button */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              className="relative hover:scale-105 transition-transform duration-200 cursor-pointer"
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-blue-600 text-xs text-white flex items-center justify-center animate-pulse">
                0
              </span>
            </Button>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden hover:scale-105 transition-all duration-200 cursor-pointer"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <div className="relative w-5 h-5">
                <Menu
                  className={`h-5 w-5 absolute transition-all duration-200 ${
                    isMenuOpen ? "rotate-90 opacity-0" : "rotate-0 opacity-100"
                  }`}
                />
                <X
                  className={`h-5 w-5 absolute transition-all duration-200 ${
                    isMenuOpen ? "rotate-0 opacity-100" : "-rotate-90 opacity-0"
                  }`}
                />
              </div>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMenuOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="px-2 pt-2 pb-3 space-y-1 border-t">
            {navigation.map((item, index) => (
              <Link
                key={item.name}
                href={item.href}
                className={`block px-3 py-2 text-base font-medium text-muted-foreground hover:text-foreground transition-all duration-200 hover:bg-muted/50 rounded-md transform cursor-pointer ${
                  isMenuOpen
                    ? "translate-x-0 opacity-100"
                    : "-translate-x-4 opacity-0"
                }`}
                style={{
                  transitionDelay: isMenuOpen ? `${index * 50}ms` : "0ms",
                }}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
