import { useEffect, useRef } from "react";
import { useProductStore } from "@/store/productStore";

export function useScrollPosition() {
  const { scrollPosition, setScrollPosition } = useProductStore();
  const isRestoring = useRef(false);

  // Save scroll position
  const saveScrollPosition = () => {
    if (typeof window !== "undefined") {
      const currentScrollY = window.scrollY;
      console.log("Saving scroll position:", currentScrollY);
      setScrollPosition(currentScrollY);
    }
  };

  // Restore scroll position
  const restoreScrollPosition = () => {
    if (typeof window !== "undefined" && scrollPosition > 0) {
      console.log("Restoring scroll position:", scrollPosition);
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

  // Restore scroll position on mount
  useEffect(() => {
    if (scrollPosition > 0) {
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        restoreScrollPosition();
      });
    }
  }, [scrollPosition]);

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
