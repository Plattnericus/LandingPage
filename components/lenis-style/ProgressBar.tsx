"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/animation";

/** Pink scroll-progress line pinned to the very top of the viewport. */
export default function ProgressBar() {
  const barRef = useRef<HTMLDivElement | null>(null);

  useGSAP(() => {
    if (!barRef.current) return;
    gsap.set(barRef.current, { scaleX: 0 });
    gsap.to(barRef.current, {
      scaleX: 1,
      ease: "none",
      scrollTrigger: {
        start: 0,
        /* "max" — not a scrollHeight calculation of our own. The showcase is
           pinned, and a pin's spacer is added and removed around ScrollTrigger's
           own measuring pass, so reading document height during a refresh gives
           a total that's short by roughly the pin distance. That made the bar
           hit 100% at about 80% of the page. "max" is resolved by ScrollTrigger
           after it has settled every pin, so it's the honest end of the scroll —
           the same keyword DynamicFavicon already tracks progress against. */
        end: "max",
        scrub: 0.4,
        invalidateOnRefresh: true,
      },
    });
  });

  return <div ref={barRef} className="progress-line" aria-hidden="true" />;
}
