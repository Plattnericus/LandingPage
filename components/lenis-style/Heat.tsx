"use client";

import { useRef } from "react";
import { BP_MOBILE, MM_DESKTOP, PIN, gsap, useGSAP } from "@/lib/animation";

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

      mm.add(MM_DESKTOP, () => {
        const cards = gsap.utils.toArray<HTMLElement>(".heat-card", section);

        const tl = gsap.timeline({
          defaults: { ease: "power2.out" },
          scrollTrigger: {
            id: "heat",
            trigger: section,
            start: "top top",
            end: `+=${PIN.heat}`,
            scrub: 1,
            pin: ".heat-pin",
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        cards.forEach((card, index) => {
          tl.fromTo(
            card,
            { y: "110vh", rotation: index % 2 ? 5 : -5, autoAlpha: 0 },
            { y: 0, rotation: 0, autoAlpha: 1, duration: 1, immediateRender: false },
            index * 0.85,
          );
        });
        tl.to({}, { duration: 0.9 });

        gsap.fromTo(
          ".heat-title",
          { y: 40, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.8,
            scrollTrigger: { trigger: section, start: "top 60%" },
          },
        );
      });

      mm.add(BP_MOBILE, () => {
        gsap.utils.toArray<HTMLElement>(".heat-card", section).forEach((card) => {
          gsap.fromTo(
            card,
            { y: 48, autoAlpha: 0 },
            {
              y: 0,
              autoAlpha: 1,
              duration: 0.7,
              ease: "power2.out",
              scrollTrigger: { trigger: card, start: "top 82%" },
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
            <div
              key={skill}
              className="heat-card"
              style={{
                left: `calc(${4 + index * 8.6}% )`,
                top: `calc(${8 + index * 8.2}vh)`,
                zIndex: index + 1,
              }}
            >
              <p className="hc-num">{String(index + 1).padStart(2, "0")}</p>
              <p className="hc-label">{skill}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
