"use client";

import { useRef } from "react";
import { NO_MOTION_PREF, gsap, useGSAP } from "@/lib/animation";

/** Custom cursor accent: a sand dot plus a lagging ring that grows over links. */
export default function CursorGlow() {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const dot = root.querySelector<HTMLElement>(".cursor-dot");
      const ring = root.querySelector<HTMLElement>(".cursor-ring");
      if (!dot || !ring) return;
      const mm = gsap.matchMedia();

      mm.add(`(pointer: fine) and ${NO_MOTION_PREF}`, () => {
        gsap.set([dot, ring], { x: -200, y: -200 });
        const dotX = gsap.quickTo(dot, "x", { duration: 0.1, ease: "power2.out" });
        const dotY = gsap.quickTo(dot, "y", { duration: 0.1, ease: "power2.out" });
        const ringX = gsap.quickTo(ring, "x", { duration: 0.45, ease: "power3.out" });
        const ringY = gsap.quickTo(ring, "y", { duration: 0.45, ease: "power3.out" });

        const onMove = (event: PointerEvent) => {
          dotX(event.clientX);
          dotY(event.clientY);
          ringX(event.clientX);
          ringY(event.clientY);
        };
        const onOver = (event: PointerEvent) => {
          const interactive = (event.target as Element | null)?.closest("a, button");
          gsap.to(ring, {
            scale: interactive ? 1.9 : 1,
            borderColor: interactive ? "rgba(230, 204, 178, 0.85)" : "rgba(221, 184, 146, 0.45)",
            duration: 0.35,
            ease: "power3.out",
          });
        };
        const onDown = () => gsap.to(ring, { scale: 0.75, duration: 0.15, ease: "power2.out" });
        const onUp = () => gsap.to(ring, { scale: 1, duration: 0.4, ease: "elastic.out(1, 0.5)" });

        window.addEventListener("pointermove", onMove, { passive: true });
        window.addEventListener("pointerover", onOver, { passive: true });
        window.addEventListener("pointerdown", onDown);
        window.addEventListener("pointerup", onUp);

        return () => {
          window.removeEventListener("pointermove", onMove);
          window.removeEventListener("pointerover", onOver);
          window.removeEventListener("pointerdown", onDown);
          window.removeEventListener("pointerup", onUp);
        };
      });
    },
    { scope: rootRef },
  );

  return (
    <div ref={rootRef} className="cursor-layer" aria-hidden="true">
      <span className="cursor-dot" />
      <span className="cursor-ring" />
    </div>
  );
}
