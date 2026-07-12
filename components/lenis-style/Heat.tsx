"use client";

import type { CSSProperties } from "react";
import { useRef } from "react";
import {
  EASE,
  NO_MOTION_PREF,
  ScrollTrigger,
  gsap,
  useGSAP,
} from "@/lib/animation";

const skills = [
  "Next.js & React",
  "Three.js & WebGL",
  "TypeScript end to end",
  "Docker & Linux",
  "Cloudflare & selfhosting",
  "Security mindset",
  "APIs & backends",
];

const CARD_TWEEN_SECONDS = 1.2;

export default function Heat() {
  const sectionRef = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      const mm = gsap.matchMedia();

      mm.add(NO_MOTION_PREF, () => {
        const cards = gsap.utils.toArray<HTMLElement>(".heat-card", section);
        const titleLines = gsap.utils.toArray<HTMLElement>(
          ".heat-title-line-inner",
          section,
        );

        gsap.set(cards, {
          autoAlpha: 0,
          xPercent: 100,
          yPercent: 100,
        });

        gsap.set(titleLines, { yPercent: 100 });
        gsap.to(titleLines, {
          yPercent: 0,
          duration: CARD_TWEEN_SECONDS,
          stagger: 0.2,
          ease: EASE.lenisExpo,
          scrollTrigger: {
            trigger: section,
            start: "top 90%",
            once: true,
          },
        });

        let activeCount = -1;

        const showCardsThrough = (nextCount: number, immediate = false) => {
          const clamped = gsap.utils.clamp(0, cards.length, nextCount);
          if (clamped === activeCount && !immediate) return;

          cards.forEach((card, index) => {
            const active = index < clamped;
            card.toggleAttribute("data-active", active);

            const vars = {
              autoAlpha: active ? 1 : 0,
              xPercent: active ? 0 : 100,
              yPercent: active ? 0 : 100,
            };

            if (immediate) {
              gsap.set(card, vars);
            } else {
              gsap.to(card, {
                ...vars,
                duration: CARD_TWEEN_SECONDS,
                ease: EASE.lenisExpo,
                overwrite: "auto",
              });
            }
          });

          activeCount = clamped;
        };

        const cardTrigger = ScrollTrigger.create({
          trigger: section,
          // Exact lenis.dev range: sectionTop - 2H -> sectionBottom - H.
          start: () => section.offsetTop - window.innerHeight * 2,
          end: () =>
            section.offsetTop + section.offsetHeight - window.innerHeight,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const stage = Math.floor(self.progress * (cards.length + 1));
            showCardsThrough(stage);
          },
          onRefresh: (self) => {
            const stage = Math.floor(self.progress * (cards.length + 1));
            showCardsThrough(stage, true);
          },
        });

        let viewportWidth = window.innerWidth;
        let refreshFrame = 0;
        const refreshAfterWidthChange = () => {
          if (window.innerWidth === viewportWidth) return;
          viewportWidth = window.innerWidth;
          window.cancelAnimationFrame(refreshFrame);
          refreshFrame = window.requestAnimationFrame(() => {
            ScrollTrigger.refresh();
          });
        };
        window.addEventListener("resize", refreshAfterWidthChange);

        const initialStage = Math.floor(
          cardTrigger.progress * (cards.length + 1),
        );
        showCardsThrough(initialStage, true);

        return () => {
          window.removeEventListener("resize", refreshAfterWidthChange);
          window.cancelAnimationFrame(refreshFrame);
          cardTrigger.kill();
          gsap.killTweensOf([...cards, ...titleLines]);
        };
      });

      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} className="heat" aria-labelledby="heat-title">
      <div className="heat-pin">
        <aside className="heat-title">
          <h2 id="heat-title">
            <span className="heat-title-line">
              <span className="heat-title-line-inner">Nexor brings</span>
            </span>
            <span className="heat-title-line ht-2">
              <span className="heat-title-line-inner">the heat</span>
            </span>
          </h2>
        </aside>

        <div
          className="heat-card-stage"
          role="list"
          aria-label="Nexor capabilities"
          style={{ "--heat-card-count": skills.length } as CSSProperties}
        >
          {skills.map((skill, index) => (
            <article
              key={skill}
              className="heat-card"
              role="listitem"
              style={{ "--heat-card-index": index } as CSSProperties}
            >
              <p className="hc-num">
                {String(index + 1).padStart(2, "0")}
              </p>
              <p className="hc-label">{skill}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
