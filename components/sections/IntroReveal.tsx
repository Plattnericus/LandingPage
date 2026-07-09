"use client";

import { useRef, useState } from "react";
import { useSmoothScroll } from "@/components/providers/SmoothScrollProvider";
import { EASE, gsap, useGSAP } from "@/lib/animation";

export default function IntroReveal() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [hidden, setHidden] = useState(false);
  const { lenisRef, completeIntro } = useSmoothScroll();

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce || window.scrollY > 4) {
        completeIntro();
        setHidden(true);
        return;
      }

      const html = document.documentElement;
      const previousOverflow = html.style.overflow;
      html.style.overflow = "hidden";
      lenisRef.current?.stop();

      let released = false;
      const release = () => {
        if (released) return;
        released = true;
        html.style.overflow = previousOverflow;
        lenisRef.current?.start();
      };

      const tl = gsap.timeline({
        onComplete: () => {
          release();
          setHidden(true);
        },
      });

      tl.fromTo(
        ".intro-glow",
        { autoAlpha: 0, scale: 0.85 },
        { autoAlpha: 1, scale: 1.08, duration: 1.0, ease: EASE.soft },
        0.05,
      )
        .fromTo(
          ".intro-domain",
          { autoAlpha: 0, y: 14, filter: "blur(18px)" },
          { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.55, ease: EASE.out },
          0,
        )
        .fromTo(
          ".intro-logo",
          { autoAlpha: 0, scale: 0.94, filter: "blur(24px)" },
          { autoAlpha: 1, scale: 1, filter: "blur(0px)", duration: 0.75, ease: EASE.out },
          0.2,
        )
        .fromTo(
          ".intro-line",
          { scaleX: 0 },
          { scaleX: 1, duration: 0.55, ease: EASE.inOut },
          0.5,
        )
        .add(completeIntro, 1.02)
        .to(root, { autoAlpha: 0, duration: 0.45, ease: EASE.inOut }, 1.05);

      return release;
    },
    { scope: rootRef },
  );

  if (hidden) return null;

  return (
    <div ref={rootRef} className="intro" role="presentation">
      <noscript>
        <style>{`.intro{display:none}`}</style>
      </noscript>
      <div className="intro-stack">
        <div className="intro-glow" aria-hidden="true" />
        <p className="intro-domain">plattnericus.dev</p>
        <p className="intro-logo">Nexor</p>
        <span className="intro-line" aria-hidden="true" />
      </div>
    </div>
  );
}
