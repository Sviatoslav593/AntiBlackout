"use client";

import Link from "next/link";
import {
  ShoppingCart,
  Menu,
  X,
  Search,
  Heart,
  ChevronDown,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useRef, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useSearch } from "@/context/SearchContext";
import { useFavorites } from "@/context/FavoritesContext";
import { useFilters } from "@/context/FilterContext";
import { motion, AnimatePresence } from "framer-motion";
import { CartDrawer } from "@/components/CartDrawer";

interface Category {
  id: number;
  name: string;
  parent_id?: number;
  children?: Category[];
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isProductsDropdownOpen, setIsProductsDropdownOpen] = useState(false);
  const [isMobileProductsDropdownOpen, setIsMobileProductsDropdownOpen] =
    useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [hasScrolledToProducts, setHasScrolledToProducts] = useState(false);
  const { state, isCartAnimating } = useCart();
  const { searchQuery, setSearchQuery, clearSearch } = useSearch();
  const { count: favoritesCount } = useFavorites();
  const { setFilters } = useFilters();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const productsDropdownRef = useRef<HTMLDivElement>(null);

  // Load categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        const data = await response.json();
        if (data.success) {
          setCategories(data.categories);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

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
  };

  // Handle search clear
  const handleSearchClear = () => {
    clearSearch();
    setHasScrolledToProducts(false); // Reset scroll state
    // Keep the field expanded after clearing so user can continue typing
    setIsSearchExpanded(true);
    // Focus back to input after clearing
    setTimeout(() => searchInputRef.current?.focus(), 100);
  };

  // Scroll to products when search starts (only once)
  useEffect(() => {
    if (searchQuery.length > 0 && !hasScrolledToProducts) {
      const el = document.getElementById("products");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        setHasScrolledToProducts(true);
      }
    }
  }, [searchQuery, hasScrolledToProducts]);

  // Reset scroll state when search is cleared
  useEffect(() => {
    if (searchQuery.length === 0) {
      setHasScrolledToProducts(false);
    }
  }, [searchQuery]);

  // Handle Enter key
  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      searchInputRef.current?.blur();
      // Scroll to products section when user presses Enter
      if (searchQuery.trim() && !hasScrolledToProducts) {
        const el = document.getElementById("products");
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
          setHasScrolledToProducts(true);
        }
      }
    } else if (e.key === "Escape") {
      // Close search field when Escape is pressed
      setIsSearchExpanded(false);
      searchInputRef.current?.blur();
    }
  };

  // Close search and dropdown when clicking outside
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

      // Close products dropdown if clicking outside
      if (
        productsDropdownRef.current &&
        !productsDropdownRef.current.contains(target)
      ) {
        setIsProductsDropdownOpen(false);
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
        if (isProductsDropdownOpen) {
          setIsProductsDropdownOpen(false);
        }
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [
    isSearchExpanded,
    isMenuOpen,
    isCartDrawerOpen,
    isProductsDropdownOpen,
    isMobileProductsDropdownOpen,
  ]);

  const getCategorySlug = (categoryName: string) => {
    return categoryName.toLowerCase().replace(/\s+/g, "-");
  };

  const handleCategoryClick = async (
    categoryName: string,
    e?: React.MouseEvent | React.TouchEvent
  ) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Check if we're on the client side
    if (typeof window === "undefined") return;

    // Navigate to home page if not already there
    const currentPath = window.location.pathname;
    if (currentPath !== "/") {
      window.location.href = `/?category=${encodeURIComponent(categoryName)}`;
      return;
    }

    // Close mobile menu and dropdown
    setIsMenuOpen(false);
    setIsMobileProductsDropdownOpen(false);
    setIsProductsDropdownOpen(false);

    // Apply category filter via URL parameters
    try {
      // First fetch all products to get category ID
      const response = await fetch("/api/products");
      const data = await response.json();

      if (data.success && data.products) {
        const categoryId = data.products.find(
          (p: any) => p.categories?.name === categoryName
        )?.category_id;

        if (categoryId) {
          console.log(
            "Header filtering by category:",
            categoryName,
            "ID:",
            categoryId
          );

          // Update URL with category filter
          const url = new URL(window.location.href);
          url.searchParams.set("categoryId", categoryId.toString());
          window.history.pushState({}, "", url.toString());

          // Trigger a custom event to update products in parent component
          window.dispatchEvent(
            new CustomEvent("categoryFilterApplied", {
              detail: { categoryId, categoryName },
            })
          );
        }
      }
    } catch (error) {
      console.error("Error applying category filter:", error);
    }

    // Scroll to products section
    setTimeout(() => {
      const el = document.getElementById("products");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  // Alias for backward compatibility
  const handleMobileCategoryClick = handleCategoryClick;

  return (
    <>
      <header 
        className="fixed top-0 left-0 right-0 z-50 w-full border-b shadow-lg"
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
            <div className="relative" ref={productsDropdownRef}>
              <Button
                variant="ghost"
                className="text-sm font-medium transition-colors hover:text-primary flex items-center space-x-1"
                onClick={() =>
                  setIsProductsDropdownOpen(!isProductsDropdownOpen)
                }
              >
                <span>Товари</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    isProductsDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </Button>

              {/* Products Dropdown */}
              <AnimatePresence>
                {isProductsDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
                  >
                    <div className="p-2">
                      {categories.map((category) => (
                        <div key={category.id} className="space-y-1">
                          <button
                            className="block w-full text-left px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 rounded-md"
                            onClick={(e) => {
                              handleCategoryClick(category.name, e);
                            }}
                          >
                            {category.name}
                          </button>
                          {category.children &&
                            category.children.length > 0 && (
                              <div className="ml-4 space-y-1">
                                {category.children.map((subcategory) => (
                                  <button
                                    key={subcategory.id}
                                    className="block w-full text-left px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
                                    onClick={(e) => {
                                      handleCategoryClick(subcategory.name, e);
                                    }}
                                  >
                                    {subcategory.name}
                                  </button>
                                ))}
                              </div>
                            )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
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
              onClick={() => (window.location.href = "/favorites")}
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

          {/* Mobile Action Buttons */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Mobile Search */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSearchToggle}
              data-search-button
            >
              <Search className="h-4 w-4" />
            </Button>

            {/* Favorites */}
            <Button
              variant="ghost"
              size="sm"
              className="relative"
              onClick={() => (window.location.href = "/favorites")}
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

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
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
                {/* Mobile Navigation Links */}
                <nav className="space-y-2">
                  <Link
                    href="/"
                    className="block py-2 text-sm font-medium transition-colors hover:text-primary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Головна
                  </Link>

                  {/* Mobile Products Dropdown */}
                  <div className="relative">
                    <button
                      className="flex items-center justify-between w-full py-2 text-sm font-medium transition-colors hover:text-primary"
                      onClick={() =>
                        setIsMobileProductsDropdownOpen(
                          !isMobileProductsDropdownOpen
                        )
                      }
                    >
                      <span>Товари</span>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          isMobileProductsDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* Mobile Categories Dropdown */}
                    <AnimatePresence>
                      {isMobileProductsDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="pl-4 space-y-2 mt-2">
                            {categories.map((category) => (
                              <div key={category.id}>
                                <button
                                  className="block w-full text-left py-2 text-sm text-muted-foreground hover:text-primary"
                                  onClick={(e) =>
                                    handleCategoryClick(category.name, e)
                                  }
                                >
                                  {category.name}
                                </button>
                                {category.children &&
                                  category.children.length > 0 && (
                                    <div className="pl-4 space-y-1">
                                      {category.children.map((subcategory) => (
                                        <button
                                          key={subcategory.id}
                                          className="block w-full text-left py-1 text-xs text-muted-foreground hover:text-primary"
                                          onClick={(e) =>
                                            handleCategoryClick(
                                              subcategory.name,
                                              e
                                            )
                                          }
                                        >
                                          {subcategory.name}
                                        </button>
                                      ))}
                                    </div>
                                  )}
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

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
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Search Field */}
        <AnimatePresence>
          {isSearchExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t bg-background"
            >
              <div className="container py-4">
                <div className="relative" ref={mobileSearchRef}>
                  <form className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      ref={searchInputRef}
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
