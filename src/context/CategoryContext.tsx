"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";

interface Category {
  id: number;
  name: string;
  parent_id?: number;
  children?: Category[];
}

interface CategoryContextType {
  currentCategory: Category | null;
  setCurrentCategory: (category: Category | null) => void;
  categories: Category[];
  setCategories: (categories: Category[]) => void;
  navigateToCategory: (categorySlug: string) => void;
  getCategorySlug: (categoryName: string) => string;
}

const CategoryContext = createContext<CategoryContextType | undefined>(
  undefined
);

export function CategoryProvider({ children }: { children: ReactNode }) {
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const router = useRouter();

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

  const getCategorySlug = (categoryName: string) => {
    return categoryName.toLowerCase().replace(/\s+/g, "-");
  };

  const navigateToCategory = (categorySlug: string) => {
    router.push(`/category/${categorySlug}`);
  };

  return (
    <CategoryContext.Provider
      value={{
        currentCategory,
        setCurrentCategory,
        categories,
        setCategories,
        navigateToCategory,
        getCategorySlug,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategory() {
  const context = useContext(CategoryContext);
  if (context === undefined) {
    throw new Error("useCategory must be used within a CategoryProvider");
  }
  return context;
}
