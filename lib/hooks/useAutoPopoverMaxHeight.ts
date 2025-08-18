"use client";
import * as React from "react";

type Options = {
  margin?: number; // reserved px around viewport for padding/header
  minHeight?: number; // floor for maxHeight
};

/**
 * Sets maxHeight and overflowY on a popover content container so it grows to the available viewport space
 * above or below the trigger element. Recomputes on resize, scroll, orientationchange, and content resize.
 */
export function useAutoPopoverMaxHeight(
  triggerRef: React.RefObject<HTMLElement>,
  contentRef: React.RefObject<HTMLElement>,
  deps: React.DependencyList = [],
  opts: Options = {}
) {
  const { margin = 48, minHeight = 160 } = opts;

  React.useEffect(() => {
    const content = contentRef.current as HTMLElement | null;
    if (!content) return;

    const update = () => {
      const viewportH = window.innerHeight;
      const trigRect = triggerRef.current?.getBoundingClientRect();
      const spaceBelow = trigRect
        ? Math.max(0, viewportH - trigRect.bottom - margin)
        : viewportH - margin;
      const spaceAbove = trigRect ? Math.max(0, trigRect.top - margin) : viewportH - margin;
      const max = Math.max(spaceBelow, spaceAbove);
      const finalMax = Math.max(minHeight, max);
      content.style.maxHeight = `${finalMax}px`;
      content.style.overflowY = "auto";
    };

    update();

    const onScroll = () => update();
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    window.addEventListener("scroll", onScroll, { passive: true });

    // Observe content size changes as well
    const ro = new ResizeObserver(update);
    ro.observe(content);

    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
      window.removeEventListener("scroll", onScroll as any);
      ro.disconnect();
      try {
        content.style.maxHeight = "";
        content.style.overflowY = "";
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
