"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUpDown } from "lucide-react";
import { Product } from "@/types/product";

export type SortOption =
  | "popularity-desc"
  | "price-asc"
  | "price-desc"
  | "name-asc"
  | "name-desc"
  | "rating-desc"
  | "newest-first";

interface SortDropdownProps {
  value: SortOption;
  onValueChange: (value: SortOption) => void;
}

const sortOptions = [
  {
    value: "popularity-desc" as SortOption,
    label: "За популярністю",
  },
  {
    value: "price-asc" as SortOption,
    label: "Ціна: від низької до високої",
  },
  {
    value: "price-desc" as SortOption,
    label: "Ціна: від високої до низької",
  },
  {
    value: "name-asc" as SortOption,
    label: "За назвою (А-Я)",
  },
  {
    value: "name-desc" as SortOption,
    label: "За назвою (Я-А)",
  },
  {
    value: "rating-desc" as SortOption,
    label: "За рейтингом",
  },
  {
    value: "newest-first" as SortOption,
    label: "Спочатку нові",
  },
];

export default function SortDropdown({
  value,
  onValueChange,
}: SortDropdownProps) {
  return (
    <div className="flex items-center gap-2">
      <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-[200px] md:w-[250px] cursor-pointer">
          <SelectValue placeholder="Сортувати за..." />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="cursor-pointer"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export const sortProducts = (products: Product[], sortBy: SortOption) => {
  const sorted = [...products];

  switch (sortBy) {
    case "popularity-desc":
      return sorted.sort((a, b) => b.popularity - a.popularity);

    case "price-asc":
      return sorted.sort((a, b) => a.price - b.price);

    case "price-desc":
      return sorted.sort((a, b) => b.price - a.price);

    case "newest-first":
      return sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

    case "name-asc":
      return sorted.sort((a, b) => a.name.localeCompare(b.name, "uk"));

    default:
      return sorted;
  }
};
