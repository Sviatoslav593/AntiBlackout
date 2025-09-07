"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useEffect,
} from "react";
import { Product } from "@/types/product";

interface FavoritesState {
  items: Product[];
  count: number;
}

type FavoritesAction =
  | { type: "ADD_TO_FAVORITES"; payload: Product }
  | { type: "REMOVE_FROM_FAVORITES"; payload: string }
  | { type: "CLEAR_FAVORITES" }
  | { type: "LOAD_FAVORITES"; payload: Product[] };

interface FavoritesContextType extends FavoritesState {
  addToFavorites: (product: Product) => void;
  removeFromFavorites: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  clearFavorites: () => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(
  undefined
);

function favoritesReducer(
  state: FavoritesState,
  action: FavoritesAction
): FavoritesState {
  switch (action.type) {
    case "ADD_TO_FAVORITES": {
      const exists = state.items.find((item) => item.id === action.payload.id);
      if (exists) {
        return state; // Don't add duplicates
      }
      const newItems = [...state.items, action.payload];
      return {
        items: newItems,
        count: newItems.length,
      };
    }
    case "REMOVE_FROM_FAVORITES": {
      const newItems = state.items.filter(
        (item) => item.id.toString() !== action.payload
      );
      return {
        items: newItems,
        count: newItems.length,
      };
    }
    case "CLEAR_FAVORITES":
      return {
        items: [],
        count: 0,
      };
    case "LOAD_FAVORITES":
      return {
        items: action.payload,
        count: action.payload.length,
      };
    default:
      return state;
  }
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(favoritesReducer, {
    items: [],
    count: 0,
  });

  // Load favorites from localStorage on mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem("favorites");
    if (savedFavorites) {
      try {
        const parsedFavorites = JSON.parse(savedFavorites);
        dispatch({ type: "LOAD_FAVORITES", payload: parsedFavorites });
      } catch (error) {
        console.error("Error loading favorites from localStorage:", error);
      }
    }
  }, []);

  // Save to localStorage whenever favorites change
  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(state.items));
  }, [state.items]);

  const addToFavorites = (product: Product) => {
    dispatch({ type: "ADD_TO_FAVORITES", payload: product });
  };

  const removeFromFavorites = (productId: string) => {
    dispatch({ type: "REMOVE_FROM_FAVORITES", payload: productId });
  };

  const isFavorite = (productId: string) => {
    return state.items.some((item) => item.id.toString() === productId);
  };

  const clearFavorites = () => {
    dispatch({ type: "CLEAR_FAVORITES" });
  };

  return (
    <FavoritesContext.Provider
      value={{
        ...state,
        addToFavorites,
        removeFromFavorites,
        isFavorite,
        clearFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
}
