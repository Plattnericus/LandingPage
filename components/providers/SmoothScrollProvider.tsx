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
import AmbientBackground from "@/components/motion/AmbientBackground";
import DynamicFavicon from "@/components/motion/DynamicFavicon";
import ScrollProgress from "@/components/motion/ScrollProgress";

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

  const value = useMemo(
    () => ({ lenisRef, introDone, completeIntro }),
    [introDone, completeIntro],
  );

  return (
    <SmoothScrollContext.Provider value={value}>
      <ScrollProgress />
      <AmbientBackground />
      <DynamicFavicon />
      {children}
    </SmoothScrollContext.Provider>
  );
}
