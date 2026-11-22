"use client";

import { useLayoutEffect, useRef, type RefObject } from "react";

export const NAVIGATION_MOTION = {
  duration: 320,
  easing: "cubic-bezier(.2,.75,.25,1)",
};
export const PAGE_MOTION = { duration: 220, easing: NAVIGATION_MOTION.easing };

export function usePageEntrance(
  element: RefObject<HTMLElement | null>,
  pathname: string,
  previousPathRef: RefObject<string | null>,
) {
  useLayoutEffect(() => {
    const previous = previousPathRef.current;
    previousPathRef.current = pathname;
    const node = element.current;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (
      !node ||
      !previous ||
      previous === pathname ||
      preference.matches ||
      document.hidden ||
      typeof node.animate !== "function"
    )
      return;
    const animation = node.animate(
      [
        { opacity: 0.8, transform: "translateY(6px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      PAGE_MOTION,
    );
    const stop = () => {
      if (preference.matches) animation.cancel();
    };
    preference.addEventListener("change", stop);
    return () => {
      animation.cancel();
      preference.removeEventListener("change", stop);
    };
  }, [element, pathname, previousPathRef]);
}

export function useNavigationSelection(
  container: RefObject<HTMLElement | null>,
  selection: RefObject<HTMLElement | null>,
  activeKey: string | undefined,
) {
  const motion = useRef<Animation | null>(null);
  const target = useRef<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const update = useRef<(animate: boolean) => void>(() => {});
  useLayoutEffect(() => {
    const nav = container.current,
      pill = selection.current;
    if (!nav || !pill) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    update.current = (animate) => {
      const link = nav.querySelector<HTMLElement>('a[aria-current="page"]');
      if (!link || !nav.getClientRects().length) {
        pill.dataset.visible = "false";
        delete nav.dataset.selectionReady;
        return;
      }
      const rect = link.getBoundingClientRect(),
        bounds = nav.getBoundingClientRect();
      const next = {
        x: rect.left - bounds.left + nav.scrollLeft,
        y: rect.top - bounds.top + nav.scrollTop,
        width: rect.width,
        height: rect.height,
      };
      if (
        target.current &&
        pill.dataset.visible === "true" &&
        Object.keys(next).every(
          (key) =>
            Math.abs(
              next[key as keyof typeof next] -
                target.current![key as keyof typeof next],
            ) < 0.5,
        )
      )
        return;
      const previous =
        target.current && pill.dataset.visible === "true"
          ? pill.getBoundingClientRect()
          : null;
      motion.current?.cancel();
      target.current = next;
      pill.style.width = `${next.width}px`;
      pill.style.height = `${next.height}px`;
      pill.style.transform = `translate(${next.x}px, ${next.y}px)`;
      pill.dataset.visible = "true";
      nav.dataset.selectionReady = "true";
      if (
        animate &&
        previous &&
        !preference.matches &&
        !document.hidden &&
        typeof pill.animate === "function"
      ) {
        motion.current = pill.animate(
          [
            {
              transform: `translate(${previous.left - bounds.left + nav.scrollLeft}px, ${previous.top - bounds.top + nav.scrollTop}px)`,
              width: `${previous.width}px`,
              height: `${previous.height}px`,
            },
            {
              transform: pill.style.transform,
              width: pill.style.width,
              height: pill.style.height,
            },
          ],
          NAVIGATION_MOTION,
        );
      }
    };
    const observer = new ResizeObserver(() => update.current(false));
    observer.observe(nav);
    nav.querySelectorAll("a").forEach((link) => observer.observe(link));
    const stop = () => {
      if (preference.matches) motion.current?.cancel();
    };
    preference.addEventListener("change", stop);
    return () => {
      observer.disconnect();
      motion.current?.cancel();
      preference.removeEventListener("change", stop);
    };
  }, [container, selection]);
  useLayoutEffect(() => {
    update.current(true);
  }, [activeKey]);
}
