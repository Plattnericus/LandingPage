"use client";

import { useRef, useState } from "react";
import LiquidBlob from "@/components/motion/LiquidBlob";
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
        { autoAlpha: 1, scale: 1.08, duration: 1.2, ease: EASE.soft },
        0.05,
      )
        .fromTo(
          ".intro-domain",
          { autoAlpha: 0, y: 14, filter: "blur(18px)" },
          { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.6, ease: EASE.out },
          0,
        )
        .fromTo(
          ".intro-logo",
          { autoAlpha: 0, scale: 0.94, filter: "blur(24px)" },
          { autoAlpha: 1, scale: 1, filter: "blur(0px)", duration: 0.85, ease: EASE.out },
          0.25,
        )
        .fromTo(
          ".intro-line",
          { scaleX: 0 },
          { scaleX: 1, duration: 0.7, ease: EASE.inOut },
          0.6,
        )
        /* hold the mark a beat with a slow breathing glow, then hand off */
        .to(".intro-logo", { scale: 1.035, duration: 0.85, ease: "sine.inOut" }, 1.1)
        .to(".intro-glow", { scale: 1.18, duration: 0.85, ease: "sine.inOut" }, 1.1)
        .add(completeIntro, 1.85)
        .to(root, { autoAlpha: 0, duration: 0.5, ease: EASE.inOut }, 1.9);

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
        <LiquidBlob className="liquid-intro" strength={0.24} />
        <div className="intro-glow" aria-hidden="true" />
        <p className="intro-domain">plattnericus.dev</p>
        <p className="intro-logo">Nexor</p>
        <span className="intro-line" aria-hidden="true" />
      </div>
    </div>
  );
}
