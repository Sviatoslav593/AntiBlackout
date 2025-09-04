"use client";

import Link from "next/link";
import { ShoppingCart, Menu, X, Search, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useRef, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useSearch } from "@/context/SearchContext";
import { useFavorites } from "@/context/FavoritesContext";
import { motion, AnimatePresence } from "framer-motion";
import { CartDrawer } from "@/components/CartDrawer";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const { state, isCartAnimating } = useCart();
  const { searchQuery, setSearchQuery, clearSearch } = useSearch();
  const { count: favoritesCount } = useFavorites();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Handle search expansion and focus
  const handleSearchToggle = () => {
    if (isSearchExpanded) {
      // If already expanded, just focus the input
      setTimeout(() => searchInputRef.current?.focus(), 100);
      return;
    }

    setIsSearchExpanded(true);
    setTimeout(() => searchInputRef.current?.focus(), 100);
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    // If there's a search query, keep the field expanded
    if (query.trim()) {
      setIsSearchExpanded(true);
    }
  };

  // Handle search clear
  const handleSearchClear = () => {
    clearSearch();
  };

  // Handle Enter key
  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      searchInputRef.current?.blur();
    }
  };

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        if (!searchQuery) {
          setIsSearchExpanded(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchQuery]);

  const navigation = [
    { name: "Головна", href: "/" },
    { name: "Товари", href: "#products" },
    { name: "Про нас", href: "#about" },
    { name: "Контакти", href: "#contact" },
  ];

  return (
    <header
      className="fixed top-0 left-0 right-0 z-[200] w-full border-b bg-white/95 backdrop-blur-md shadow-sm supports-[backdrop-filter]:bg-white/80"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 200,
        width: "100%",
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid #e5e7eb",
        boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
      }}
    >
      <div className="container px-2 sm:px-4">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-1 sm:space-x-2 cursor-pointer min-w-0 flex-shrink"
          >
            <div className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xs sm:text-sm">
              AB
            </div>
            <span className="text-sm sm:text-xl font-bold text-foreground truncate max-w-[120px] sm:max-w-none">
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

          {/* Search & Actions */}
          <div className="flex items-center space-x-1 sm:space-x-2 h-8 sm:h-10 flex-shrink-0">
            {/* Search Field - Desktop */}
            <div
              ref={searchContainerRef}
              className="hidden md:flex items-center"
            >
              <AnimatePresence>
                {isSearchExpanded ? (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: "240px", opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="relative overflow-hidden"
                  >
                    <Input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Пошук товарів..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                      onKeyPress={handleSearchKeyPress}
                      className="w-full pr-8 h-9 text-sm border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                    {searchQuery && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSearchClear}
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-gray-100"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </motion.div>
                ) : null}
              </AnimatePresence>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleSearchToggle}
                className="ml-1 sm:ml-2 h-8 w-8 sm:h-10 sm:w-10 hover:scale-105 transition-transform duration-200 cursor-pointer flex items-center justify-center"
              >
                <Search className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>

            {/* Search Button - Mobile */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSearchToggle}
              className="md:hidden h-8 w-8 sm:h-10 sm:w-10 hover:scale-105 transition-transform duration-200 cursor-pointer flex items-center justify-center"
            >
              <Search className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>

            {/* Favorites Button */}
            <Link href="/favorites">
              <Button
                variant="ghost"
                size="icon"
                className="relative h-8 w-8 sm:h-10 sm:w-10 hover:scale-105 transition-transform duration-200 cursor-pointer flex items-center justify-center"
              >
                <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
                {favoritesCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-red-500 text-xs text-white flex items-center justify-center font-semibold"
                  >
                    {favoritesCount}
                  </motion.span>
                )}
              </Button>
            </Link>

            {/* Cart Button */}
            <Button
              variant="ghost"
              size="icon"
              className="relative h-8 w-8 sm:h-10 sm:w-10 hover:scale-105 transition-transform duration-200 cursor-pointer flex items-center justify-center"
              onClick={() => setIsCartDrawerOpen(true)}
            >
              <motion.div
                animate={
                  isCartAnimating
                    ? {
                        scale: [1, 1.2, 1],
                        rotate: [0, -10, 10, 0],
                      }
                    : {}
                }
                transition={{ duration: 0.6, ease: "easeInOut" }}
              >
                <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
              </motion.div>
              {state.itemCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-blue-600 text-xs text-white flex items-center justify-center font-semibold"
                >
                  {state.itemCount}
                </motion.span>
              )}
            </Button>

            {/* Cart Drawer */}
            <CartDrawer
              isOpen={isCartDrawerOpen}
              onClose={() => setIsCartDrawerOpen(false)}
            />

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-8 w-8 sm:h-10 sm:w-10 hover:scale-105 transition-all duration-200 cursor-pointer flex items-center justify-center"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <div className="relative w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                <Menu
                  className={`h-4 w-4 sm:h-5 sm:w-5 absolute transition-all duration-200 ${
                    isMenuOpen ? "rotate-90 opacity-0" : "rotate-0 opacity-100"
                  }`}
                />
                <X
                  className={`h-4 w-4 sm:h-5 sm:w-5 absolute transition-all duration-200 ${
                    isMenuOpen ? "rotate-0 opacity-100" : "-rotate-90 opacity-0"
                  }`}
                />
              </div>
            </Button>
          </div>
        </div>

        {/* Mobile Search */}
        <AnimatePresence>
          {isSearchExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="md:hidden border-t bg-white/95 backdrop-blur-md overflow-hidden"
            >
              <div className="px-4 py-3">
                <div className="relative">
                  <Input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Пошук товарів..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onKeyPress={handleSearchKeyPress}
                    className="w-full pr-8 h-10 text-base border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSearchClear}
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
