"use client";

import { useRef } from "react";
import { BP_DESKTOP, NO_MOTION_PREF, gsap, useGSAP } from "@/lib/animation";

export default function AmbientBackground() {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(`${BP_DESKTOP} and ${NO_MOTION_PREF}`, () => {
        const blobs = gsap.utils.toArray<HTMLElement>(".glow-blob", rootRef.current);
        const drifts = blobs.map((blob, index) =>
          gsap.to(blob, {
            xPercent: index % 2 ? -11 : 9,
            yPercent: index % 2 ? 8 : -7,
            scale: 1.14,
            duration: 26 + index * 10,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
          }),
        );

        const onVisibility = () => {
          drifts.forEach((tween) => (document.hidden ? tween.pause() : tween.resume()));
        };
        document.addEventListener("visibilitychange", onVisibility);

        return () => document.removeEventListener("visibilitychange", onVisibility);
      });
    },
    { scope: rootRef },
  );

  return (
    <div ref={rootRef} className="ambient" aria-hidden="true">
      <div className="glow-blob glow-blob-a" />
      <div className="glow-blob glow-blob-b" />
      <div className="grain" />
    </div>
  );
}
