"use client";

import { useRef, type ElementType } from "react";
import { EASE, NO_MOTION_PREF, SplitText, gsap, useGSAP } from "@/lib/animation";

type AnimatedHeadlineProps = {
  children: string;
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
  id?: string;
  /** "enter": words rise once into view. "scrub-blur": lines sharpen from blur while scrolling. */
  mode?: "enter" | "scrub-blur";
  start?: string;
};

export default function AnimatedHeadline({
  children,
  as = "h2",
  className,
  id,
  mode = "enter",
  start = "top 80%",
}: AnimatedHeadlineProps) {
  const ref = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();

      mm.add(NO_MOTION_PREF, () => {
        const split = SplitText.create(el, {
          type: "lines,words",
          mask: "lines",
          autoSplit: true,
          onSplit: (self) => {
            if (mode === "scrub-blur") {
              return gsap.fromTo(
                self.lines,
                { filter: "blur(16px)", opacity: 0.12, yPercent: 22 },
                {
                  filter: "blur(0px)",
                  opacity: 1,
                  yPercent: 0,
                  stagger: 0.14,
                  ease: "none",
                  scrollTrigger: {
                    trigger: el,
                    start: "top 84%",
                    end: "top 34%",
                    scrub: 1,
                  },
                },
              );
            }
            return gsap.from(self.words, {
              yPercent: 115,
              duration: 1.05,
              stagger: 0.05,
              ease: EASE.out,
              scrollTrigger: { trigger: el, start },
            });
          },
        });

        return () => split.revert();
      });
    },
    { scope: ref },
  );

  const Tag = as as ElementType;

  return (
    <Tag
      ref={(node: HTMLElement | null) => {
        ref.current = node;
      }}
      className={className}
      id={id}
    >
      {children}
    </Tag>
  );
}
