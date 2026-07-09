"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/animation";

export default function ScrollProgress() {
  const barRef = useRef<HTMLDivElement | null>(null);

  useGSAP(() => {
    gsap.to(barRef.current, {
      scaleX: 1,
      ease: "none",
      scrollTrigger: { start: 0, end: "max", scrub: 0.4 },
    });
  });

  return <div ref={barRef} className="scroll-progress" aria-hidden="true" />;
}
