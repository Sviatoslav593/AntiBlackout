"use client";

import { Suspense, ReactNode } from "react";
import { useUrlFilters } from "@/hooks/useUrlFilters";

interface UrlFiltersProviderProps {
  children: ReactNode;
}

function UrlFiltersContent({ children }: UrlFiltersProviderProps) {
  // This component uses useUrlFilters which requires useSearchParams
  useUrlFilters();
  return <>{children}</>;
}

export default function UrlFiltersProvider({
  children,
}: UrlFiltersProviderProps) {
  return (
    <Suspense fallback={<div>Loading filters...</div>}>
      <UrlFiltersContent>{children}</UrlFiltersContent>
    </Suspense>
  );
}
