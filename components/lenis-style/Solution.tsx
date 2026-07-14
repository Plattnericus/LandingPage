"use client";

import { useRef } from "react";
import { EASE, NO_MOTION_PREF, SplitText, gsap, useGSAP } from "@/lib/animation";
import { siteConfig } from "@/lib/site";

export default function Solution() {
  const sectionRef = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      const copy = sectionRef.current?.querySelector<HTMLElement>(".solution-copy");
      if (!copy) return;
      const mm = gsap.matchMedia();

      mm.add(NO_MOTION_PREF, () => {
        const split = SplitText.create(copy, { type: "words" });
        gsap.fromTo(
          split.words,
          { autoAlpha: 0.14, yPercent: 12 },
          {
            autoAlpha: 1,
            yPercent: 0,
            stagger: 0.5,
            ease: "none",
            scrollTrigger: {
              trigger: copy,
              start: "top 78%",
              end: "bottom 46%",
              scrub: 1,
            },
          },
        );

        gsap.fromTo(
          ".solution-foot",
          { y: 26, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.8,
            ease: EASE.soft,
            scrollTrigger: { trigger: ".solution-foot", start: "top 88%" },
          },
        );

        return () => split.revert();
      });

      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} className="solution" id="about" aria-label="About Nexor">
      <p className="solution-copy">
        Nexor is a fullstack developer from South Tyrol who turns ideas into fast, secure,
        deployed products. Frontend, backend, APIs and the{" "}
        <a href="https://streamdeck.plattnericus.dev/desktop" target="_blank" rel="noreferrer">
          interfaces
        </a>{" "}
        on top — plus the{" "}
        <a href="https://pokyh.com" target="_blank" rel="noreferrer">
          platforms
        </a>{" "}
        real people use every day. All of it selfhosted, containerised and shipped from{" "}
        <a href={siteConfig.github} target="_blank" rel="noreferrer">
          github.com/Plattnericus
        </a>
        .
      </p>
      <p className="solution-foot">
        Building something?{" "}
        <a href={`mailto:${siteConfig.email}`}>Work with me</a> or explore the{" "}
        <a href={siteConfig.github} target="_blank" rel="noreferrer">
          repositories
        </a>
        .
      </p>
    </section>
  );
}
