"use client";

import Link from "next/link";
import { ShoppingCart, Menu, X, Search, Heart, Zap } from "lucide-react";
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
  const { searchQuery, setSearchQuery, clearSearch, scrollToProducts } =
    useSearch();
  const { count: favoritesCount } = useFavorites();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);

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

    // Always keep the field expanded when user is typing
    setIsSearchExpanded(true);

    // If there's a search query, scroll to products
    if (query.trim()) {
      // Scroll to products section - delay is handled in SearchContext
      scrollToProducts();
    }
  };

  // Handle search clear
  const handleSearchClear = () => {
    clearSearch();
    // Keep the field expanded after clearing so user can continue typing
    setIsSearchExpanded(true);
    // Focus back to input after clearing
    setTimeout(() => searchInputRef.current?.focus(), 100);
  };

  // Handle Enter key
  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      searchInputRef.current?.blur();
      // Scroll to products section when user presses Enter
      if (searchQuery.trim()) {
        scrollToProducts();
      }
    } else if (e.key === "Escape") {
      // Close search field when Escape is pressed
      setIsSearchExpanded(false);
      searchInputRef.current?.blur();
    }
  };

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      // Check if click is on search button - if so, don't close
      const isSearchButton = (target as Element)?.closest(
        "[data-search-button]"
      );
      if (isSearchButton) {
        return;
      }

      // Check if click is outside both desktop and mobile search containers
      const isOutsideDesktop = !searchContainerRef.current?.contains(target);
      const isOutsideMobile = !mobileSearchRef.current?.contains(target);

      // Only close if click is outside both containers
      if (isOutsideDesktop && isOutsideMobile) {
        // Only close if search query is empty
        if (!searchQuery.trim()) {
          setIsSearchExpanded(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchQuery]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isSearchExpanded) {
          setIsSearchExpanded(false);
          searchInputRef.current?.blur();
        }
        if (isMenuOpen) {
          setIsMenuOpen(false);
        }
        if (isCartDrawerOpen) {
          setIsCartDrawerOpen(false);
        }
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isSearchExpanded, isMenuOpen, isCartDrawerOpen]);

  return (
    <>
      <header 
        className="sticky top-0 z-50 w-full border-b shadow-lg"
        style={{
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(35px) saturate(180%) brightness(1.05)',
          WebkitBackdropFilter: 'blur(35px) saturate(180%) brightness(1.05)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.25)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
        }}
      >
        <div className="container flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl">AntiBlackout</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Головна
            </Link>
            <Link
              href="/products"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Товари
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Про нас
            </Link>
            <Link
              href="/contact"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Контакти
            </Link>
          </nav>

          {/* Desktop Search */}
          <div className="hidden md:flex items-center space-x-4">
            <div
              ref={searchContainerRef}
              className={`relative transition-all duration-300 ${
                isSearchExpanded ? "w-80" : "w-10"
              }`}
            >
              <form className="relative">
                <Search
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground transition-opacity duration-200 ${
                    isSearchExpanded ? "opacity-100" : "opacity-0"
                  }`}
                />
                <Input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Пошук товарів..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onKeyPress={handleSearchKeyPress}
                  className={`pl-10 pr-10 transition-all duration-300 ${
                    isSearchExpanded
                      ? "opacity-100 w-full"
                      : "opacity-0 w-0 cursor-pointer"
                  }`}
                />
                {isSearchExpanded && searchQuery && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                    onClick={handleSearchClear}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </form>
              {!isSearchExpanded && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute inset-0 h-full w-full p-0"
                  onClick={handleSearchToggle}
                  data-search-button
                >
                  <Search className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Favorites */}
            <Button
              variant="ghost"
              size="sm"
              className="relative"
              onClick={() => scrollToProducts()}
            >
              <Heart className="h-4 w-4" />
              {favoritesCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                  {favoritesCount}
                </span>
              )}
            </Button>

            {/* Cart */}
            <Button
              variant="ghost"
              size="sm"
              className="relative"
              onClick={() => setIsCartDrawerOpen(true)}
            >
              <ShoppingCart className="h-4 w-4" />
              {state.items.length > 0 && (
                <motion.span
                  className={`absolute -top-1 -right-1 h-5 w-5 rounded-full bg-blue-600 text-xs text-white flex items-center justify-center ${
                    isCartAnimating ? "animate-bounce" : ""
                  }`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  {state.items.length}
                </motion.span>
              )}
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t bg-background"
            >
              <div className="container py-4 space-y-4">
                {/* Mobile Search */}
                <div ref={mobileSearchRef} className="relative">
                  <form className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Пошук товарів..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                      onKeyPress={handleSearchKeyPress}
                      className="pl-10 pr-10"
                    />
                    {searchQuery && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                        onClick={handleSearchClear}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </form>
                </div>

                {/* Mobile Navigation Links */}
                <nav className="space-y-2">
                  <Link
                    href="/"
                    className="block py-2 text-sm font-medium transition-colors hover:text-primary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Головна
                  </Link>
                  <Link
                    href="/products"
                    className="block py-2 text-sm font-medium transition-colors hover:text-primary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Товари
                  </Link>
                  <Link
                    href="/about"
                    className="block py-2 text-sm font-medium transition-colors hover:text-primary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Про нас
                  </Link>
                  <Link
                    href="/contact"
                    className="block py-2 text-sm font-medium transition-colors hover:text-primary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Контакти
                  </Link>
                </nav>

                {/* Mobile Action Buttons */}
                <div className="flex items-center space-x-4 pt-4 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center space-x-2"
                    onClick={() => {
                      scrollToProducts();
                      setIsMenuOpen(false);
                    }}
                  >
                    <Heart className="h-4 w-4" />
                    <span>Обране ({favoritesCount})</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center space-x-2"
                    onClick={() => {
                      setIsCartDrawerOpen(true);
                      setIsMenuOpen(false);
                    }}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    <span>Кошик ({state.items.length})</span>
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartDrawerOpen}
        onClose={() => setIsCartDrawerOpen(false)}
      />
    </>
  );
}
