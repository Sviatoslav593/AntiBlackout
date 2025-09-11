import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useProductStore } from "@/store/productStore";

export function useScrollPosition() {
  const { scrollPosition, setScrollPosition } = useProductStore();
  const isRestoring = useRef(false);
  const hasRestored = useRef(false);
  const pathname = usePathname();
  
  // Only work on homepage
  const isHomepage = pathname === "/";

  // Save scroll position (only on homepage)
  const saveScrollPosition = () => {
    if (typeof window !== "undefined" && isHomepage) {
      const currentScrollY = window.scrollY;
      console.log("Saving scroll position on homepage:", currentScrollY);
      setScrollPosition(currentScrollY);
    }
  };

  // Restore scroll position (only on homepage)
  const restoreScrollPosition = () => {
    if (
      typeof window !== "undefined" &&
      isHomepage &&
      scrollPosition > 0 &&
      !isRestoring.current
    ) {
      console.log("Restoring scroll position on homepage:", scrollPosition);
      isRestoring.current = true;

      // Use requestAnimationFrame for better timing
      requestAnimationFrame(() => {
        window.scrollTo(0, scrollPosition);

        // Reset flag after scroll
        setTimeout(() => {
          isRestoring.current = false;
        }, 100);
      });
    }
  };

  // Save scroll position on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveScrollPosition();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        saveScrollPosition();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [setScrollPosition]);

  // Restore scroll position on mount (only once) or reset to top for other pages
  useEffect(() => {
    if (isHomepage) {
      // On homepage, restore saved scroll position
      if (scrollPosition > 0 && !hasRestored.current) {
        hasRestored.current = true;
        // Use requestAnimationFrame to ensure DOM is ready
        requestAnimationFrame(() => {
          restoreScrollPosition();
        });
      }
    } else {
      // On other pages, scroll to top
      if (typeof window !== "undefined") {
        console.log("Non-homepage detected, scrolling to top");
        window.scrollTo(0, 0);
      }
    }
  }, [scrollPosition, isHomepage]);

  // Listen for sessionStorage changes to restore scroll position
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "fromProductPage" && e.newValue === "true") {
        const savedScrollPosition = sessionStorage.getItem("scrollPosition");
        if (savedScrollPosition) {
          const scrollY = parseInt(savedScrollPosition);
          console.log(
            "useScrollPosition: Storage change - restoring scroll position:",
            scrollY
          );

          // Add delay to ensure DOM is fully loaded
          setTimeout(() => {
            window.scrollTo(0, scrollY);
            // Clean up sessionStorage
            sessionStorage.removeItem("scrollPosition");
            sessionStorage.removeItem("fromProductPage");
          }, 100);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Save scroll position on scroll (with throttling) - only on homepage
  useEffect(() => {
    if (!isHomepage) return;
    
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
  }, [setScrollPosition, isHomepage]);

  return {
    scrollPosition,
    saveScrollPosition,
    restoreScrollPosition,
  };
}
