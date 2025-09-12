"use client";

import { Suspense } from "react";
import { useSearchSync } from "@/hooks/useSearchSync";

function SearchSyncContent() {
  useSearchSync();
  return null;
}

export default function SearchSync() {
  return (
    <Suspense fallback={null}>
      <SearchSyncContent />
    </Suspense>
  );
}
