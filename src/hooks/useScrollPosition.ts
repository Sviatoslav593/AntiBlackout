import { useEffect, useRef } from "react";
import { useProductStore } from "@/store/productStore";

export function useScrollPosition() {
  const { scrollPosition, setScrollPosition } = useProductStore();
  const isRestoring = useRef(false);

  // Save scroll position
  const saveScrollPosition = () => {
    if (typeof window !== "undefined") {
      setScrollPosition(window.scrollY);
    }
  };

  // Restore scroll position
  const restoreScrollPosition = () => {
    if (typeof window !== "undefined" && scrollPosition > 0) {
      isRestoring.current = true;
      window.scrollTo(0, scrollPosition);

      // Reset flag after scroll
      setTimeout(() => {
        isRestoring.current = false;
      }, 100);
    }
  };

  // Save scroll position on page unload and navigation
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveScrollPosition();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        saveScrollPosition();
      }
    };

    // Save scroll position before navigation
    const handleBeforeNavigate = () => {
      saveScrollPosition();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Listen for navigation events (Next.js router events)
    window.addEventListener("beforeunload", handleBeforeNavigate);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeNavigate);
    };
  }, [setScrollPosition]);

  // Restore scroll position on mount (only on homepage and only if returning from product page)
  useEffect(() => {
    if (scrollPosition > 0 && typeof window !== "undefined") {
      // Only restore scroll position on homepage, not on product pages
      const isProductPage = window.location.pathname.includes("/product/");
      const fromProductPage = sessionStorage.getItem("fromProductPage");

      if (!isProductPage && fromProductPage) {
        // Use requestAnimationFrame to ensure DOM is ready
        requestAnimationFrame(() => {
          restoreScrollPosition();
        });
      }
    }
  }, []);

  // Save scroll position on scroll (with throttling)
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleScroll = () => {
      if (!isRestoring.current) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          saveScrollPosition();
        }, 100);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timeoutId);
    };
  }, [setScrollPosition]);

  return {
    scrollPosition,
    saveScrollPosition,
    restoreScrollPosition,
  };
}
