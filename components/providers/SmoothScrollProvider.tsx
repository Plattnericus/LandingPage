"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/animation";
import DynamicFavicon from "@/components/motion/DynamicFavicon";

type SmoothScrollContextValue = {
  lenisRef: RefObject<Lenis | null>;
  introDone: boolean;
  completeIntro: () => void;
};

const SmoothScrollContext = createContext<SmoothScrollContextValue | null>(null);

export function useSmoothScroll() {
  const value = useContext(SmoothScrollContext);
  if (!value) {
    throw new Error("useSmoothScroll must be used inside SmoothScrollProvider");
  }
  return value;
}

export default function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const [introDone, setIntroDone] = useState(false);
  const completeIntro = useCallback(() => setIntroDone(true), []);

  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh).catch(() => {});
    window.addEventListener("load", refresh, { once: true });

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return () => window.removeEventListener("load", refresh);
    }

    const lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
      anchors: true,
      autoRaf: false,
    });
    lenisRef.current = lenis;

    lenis.on("scroll", () => ScrollTrigger.update());
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    ScrollTrigger.config({ ignoreMobileResize: true });

    return () => {
      window.removeEventListener("load", refresh);
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  /* Keep the reader's place when the layout crosses the desktop/mobile
     breakpoint (a rotated tablet, a resized window). gsap.matchMedia reverts
     the section timelines there, and the refresh that follows measures from
     scroll 0 without restoring the old position — the page jumped back to the
     top. The section at the top of the viewport (and how far into it) is
     tracked from real scrolls only, then restored after each refresh that
     follows the switch; sections change height between layouts, so a raw
     pixel offset would land somewhere else. */
  useEffect(() => {
    const breakpoint = window.matchMedia("(min-width: 900px)");
    let anchor: { el: Element; ratio: number } | null = null;
    let frame = 0;
    let settleTimer = 0;
    let restoreListener: (() => void) | null = null;

    const capture = () => {
      const sections = document.querySelectorAll("main > section, main > footer");
      for (const el of sections) {
        const rect = el.getBoundingClientRect();
        if (rect.bottom > 0) {
          anchor = { el, ratio: Math.max(0, -rect.top) / Math.max(1, rect.height) };
          return;
        }
      }
    };
    /* ScrollTrigger parks the page at 0 while it measures — never record that */
    let refreshing = false;
    const onRefreshInit = () => {
      refreshing = true;
    };
    const onRefreshDone = () => {
      refreshing = false;
    };
    ScrollTrigger.addEventListener("refreshInit", onRefreshInit);
    ScrollTrigger.addEventListener("refresh", onRefreshDone);
    /* measured once the scroll comes to rest, not on every scroll frame —
       a breakpoint change only ever happens between scrolls (a resize or a
       rotation), and per-frame section reads forced extra layout work */
    const onScroll = () => {
      if (refreshing || restoreListener) return;
      window.clearTimeout(frame);
      frame = window.setTimeout(capture, 180);
    };

    const stopRestoring = () => {
      if (restoreListener) ScrollTrigger.removeEventListener("refresh", restoreListener);
      restoreListener = null;
    };
    const onBreakpoint = () => {
      const saved = anchor;
      if (!saved || (saved.el === document.querySelector("main > *") && saved.ratio === 0)) return;
      stopRestoring();
      const restore = () => {
        if (!saved.el.isConnected) return;
        const rect = saved.el.getBoundingClientRect();
        const y = Math.round(rect.top + window.scrollY + saved.ratio * rect.height);
        if (Math.abs(window.scrollY - y) < 2) return;
        const lenis = lenisRef.current;
        if (lenis) lenis.scrollTo(y, { immediate: true, force: true });
        else window.scrollTo(0, y);
        ScrollTrigger.update();
      };
      restoreListener = restore;
      ScrollTrigger.addEventListener("refresh", restore);
      window.clearTimeout(settleTimer);
      /* the switch triggers a short burst of refreshes; after that, normal
         scroll tracking takes over again */
      settleTimer = window.setTimeout(() => {
        restore();
        stopRestoring();
        capture();
      }, 1500);
    };

    capture();
    window.addEventListener("scroll", onScroll, { passive: true });
    breakpoint.addEventListener("change", onBreakpoint);
    return () => {
      window.removeEventListener("scroll", onScroll);
      breakpoint.removeEventListener("change", onBreakpoint);
      ScrollTrigger.removeEventListener("refreshInit", onRefreshInit);
      ScrollTrigger.removeEventListener("refresh", onRefreshDone);
      window.clearTimeout(frame);
      window.clearTimeout(settleTimer);
      stopRestoring();
    };
  }, []);

  /* hold the page still behind the intro loader, release on completion */
  useEffect(() => {
    if (introDone) {
      document.documentElement.classList.remove("no-scroll");
      lenisRef.current?.start();
      /* make sure the ticker is running for the hero handoff timeline */
      gsap.ticker.wake();
      ScrollTrigger.refresh();
    } else {
      document.documentElement.classList.add("no-scroll");
      lenisRef.current?.stop();
    }
    return () => document.documentElement.classList.remove("no-scroll");
  }, [introDone]);

  const value = useMemo(
    () => ({ lenisRef, introDone, completeIntro }),
    [introDone, completeIntro],
  );

  return (
    <SmoothScrollContext.Provider value={value}>
      <DynamicFavicon />
      {children}
    </SmoothScrollContext.Provider>
  );
}
