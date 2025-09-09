"use client";

import Link from "next/link";
import { ShoppingCart, Menu, X, Search, Heart, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useState, useRef, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useSearch } from "@/context/SearchContext";
import { useFavorites } from "@/context/FavoritesContext";
import { motion, AnimatePresence } from "framer-motion";
import { CartDrawer } from "@/components/CartDrawer";

interface Category {
  id: number;
  name: string;
  parent_id?: number;
  children?: Category[];
}

export default function HeaderWithCategories() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const { state, isCartAnimating } = useCart();
  const { searchQuery, setSearchQuery, clearSearch, scrollToProducts } =
    useSearch();
  const { count: favoritesCount } = useFavorites();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);

  // Fetch categories on mount
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

    // If there's a search query, scroll to products
    if (query.trim()) {
      // Scroll to products section - delay is handled in SearchContext
      scrollToProducts();
    }
  };

  // Handle search form submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      scrollToProducts();
    }
  };

  // Handle search clear
  const handleSearchClear = () => {
    setSearchQuery("");
    clearSearch();
    setIsSearchExpanded(false);
  };

  // Handle search input blur
  const handleSearchBlur = (e: React.FocusEvent) => {
    // Only collapse if clicking outside the search container
    if (
      searchContainerRef.current &&
      !searchContainerRef.current.contains(e.relatedTarget as Node)
    ) {
      // Delay to allow for clicking on search results
      setTimeout(() => {
        if (!searchQuery.trim()) {
          setIsSearchExpanded(false);
        }
      }, 150);
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isSearchExpanded) {
          handleSearchClear();
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

  // Handle click outside to close mobile search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileSearchRef.current &&
        !mobileSearchRef.current.contains(event.target as Node)
      ) {
        setIsSearchExpanded(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getCategorySlug = (categoryName: string) => {
    return categoryName.toLowerCase().replace(/\s+/g, '-');
  };

  const renderCategoryItem = (category: Category) => {
    const slug = getCategorySlug(category.name);
    return (
      <DropdownMenuItem key={category.id} asChild>
        <Link href={`/category/${slug}`} className="flex items-center">
          {category.name}
        </Link>
      </DropdownMenuItem>
    );
  };

  const renderCategoryWithChildren = (category: Category) => {
    if (category.children && category.children.length > 0) {
      return (
        <DropdownMenuItem key={category.id} asChild>
          <Link href={`/category/${getCategorySlug(category.name)}`} className="flex items-center justify-between">
            {category.name}
            <ChevronDown className="h-4 w-4 ml-2" />
          </Link>
        </DropdownMenuItem>
      );
    }
    return renderCategoryItem(category);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AB</span>
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

            {/* Categories Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-1">
                  <span>Товари</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {categories.map((category) => renderCategoryWithChildren(category))}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/products" className="flex items-center">
                    Всі товари
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

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
              <form onSubmit={handleSearchSubmit} className="relative">
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
                  onBlur={handleSearchBlur}
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
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
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
                  <form onSubmit={handleSearchSubmit} className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Пошук товарів..."
                      value={searchQuery}
                      onChange={handleSearchChange}
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

                  {/* Mobile Categories */}
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">
                      Категорії
                    </div>
                    {categories.map((category) => (
                      <Link
                        key={category.id}
                        href={`/category/${getCategorySlug(category.name)}`}
                        className="block py-1 pl-4 text-sm transition-colors hover:text-primary"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {category.name}
                      </Link>
                    ))}
                    <Link
                      href="/products"
                      className="block py-1 pl-4 text-sm transition-colors hover:text-primary"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Всі товари
                    </Link>
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
