"use client";

import { Suspense } from "react";
import { useUrlFilters } from "@/hooks/useUrlFilters";

interface UrlFiltersProviderProps {
  children: (urlFilters: ReturnType<typeof useUrlFilters>) => React.ReactNode;
}

export function UrlFiltersProvider({ children }: UrlFiltersProviderProps) {
  return (
    <Suspense fallback={<div>Loading filters...</div>}>
      <UrlFiltersContent>{children}</UrlFiltersContent>
    </Suspense>
  );
}

function UrlFiltersContent({ children }: UrlFiltersProviderProps) {
  const urlFilters = useUrlFilters();
  return <>{children(urlFilters)}</>;
}
