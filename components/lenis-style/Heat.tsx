"use client";

import { useRef } from "react";
import { NO_MOTION_PREF, gsap, useGSAP } from "@/lib/animation";

const skills = [
  "Next.js & React",
  "Three.js & WebGL",
  "TypeScript end to end",
  "Docker & Linux",
  "Cloudflare & selfhosting",
  "Security mindset",
  "APIs & backends",
];

export default function Heat() {
  const sectionRef = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;
      const mm = gsap.matchMedia();

      /* lenis.dev doesn't pin this section at all — cards sit in normal
         scroll flow and each fades up individually as it enters view. One
         shared trigger per card instead of a pinned scrub timeline. */
      mm.add(NO_MOTION_PREF, () => {
        gsap.fromTo(
          ".heat-title",
          { y: 40, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.8,
            scrollTrigger: { trigger: section, start: "top 75%" },
          },
        );

        gsap.utils.toArray<HTMLElement>(".heat-card", section).forEach((card) => {
          gsap.fromTo(
            card,
            { y: 56, autoAlpha: 0 },
            {
              y: 0,
              autoAlpha: 1,
              duration: 0.7,
              ease: "power2.out",
              scrollTrigger: { trigger: card, start: "top 85%" },
            },
          );
        });
      });
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} className="heat" aria-labelledby="heat-title">
      <div className="heat-pin">
        <h2 className="heat-title" id="heat-title">
          Nexor brings
          <br />
          <span className="ht-2">the heat</span>
        </h2>
        <div className="heat-cards">
          {skills.map((skill, index) => (
            <div key={skill} className="heat-card">
              <p className="hc-num">{String(index + 1).padStart(2, "0")}</p>
              <p className="hc-label">{skill}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
