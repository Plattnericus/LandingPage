"use client";

import type { RefObject } from "react";
import { NO_MOTION_PREF, gsap, useGSAP } from "@/lib/animation";

/**
 * Mouse-move depth parallax: children carrying `data-depth` (max shift in px)
 * drift toward the pointer while it moves over the container.
 */
export function useDepth(containerRef: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const container = containerRef.current;
      if (!container) return;
      const mm = gsap.matchMedia();

      mm.add(`(pointer: fine) and ${NO_MOTION_PREF}`, () => {
        const layers = gsap.utils.toArray<HTMLElement>("[data-depth]", container);
        if (!layers.length) return;

        const setters = layers.map((layer) => ({
          depth: parseFloat(layer.dataset.depth ?? "0"),
          x: gsap.quickTo(layer, "x", { duration: 0.9, ease: "power3.out" }),
          y: gsap.quickTo(layer, "y", { duration: 0.9, ease: "power3.out" }),
        }));

        const onMove = (event: PointerEvent) => {
          const rect = container.getBoundingClientRect();
          const nx = gsap.utils.clamp(-1, 1, ((event.clientX - rect.left) / rect.width) * 2 - 1);
          const ny = gsap.utils.clamp(-1, 1, ((event.clientY - rect.top) / rect.height) * 2 - 1);
          setters.forEach((setter) => {
            setter.x(nx * setter.depth);
            setter.y(ny * setter.depth);
          });
        };
        const onLeave = () => {
          setters.forEach((setter) => {
            setter.x(0);
            setter.y(0);
          });
        };

        container.addEventListener("pointermove", onMove);
        container.addEventListener("pointerleave", onLeave);

        return () => {
          container.removeEventListener("pointermove", onMove);
          container.removeEventListener("pointerleave", onLeave);
        };
      });
    },
    { scope: containerRef },
  );
}
