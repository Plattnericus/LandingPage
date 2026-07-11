"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/animation";

/** Pink scroll-progress line pinned to the very top of the viewport. */
export default function ProgressBar() {
  const barRef = useRef<HTMLDivElement | null>(null);

  useGSAP(() => {
    if (!barRef.current) return;
    gsap.to(barRef.current, {
      scaleX: 1,
      ease: "none",
      scrollTrigger: {
        start: 0,
        end: () => document.documentElement.scrollHeight - window.innerHeight,
        scrub: 0.4,
      },
    });
  });

  return <div ref={barRef} className="progress-line" aria-hidden="true" />;
}
