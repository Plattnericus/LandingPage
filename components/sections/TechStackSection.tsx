"use client";

import { useRef } from "react";
import { Code2, Database, Globe, Hammer, Workflow } from "lucide-react";
import AnimatedHeadline from "@/components/motion/AnimatedHeadline";
import { EASE, MM_DESKTOP, NO_MOTION_PREF, gsap, useGSAP } from "@/lib/animation";
import { techGroups } from "@/lib/content";

const GROUP_ICONS = [Code2, Globe, Database, Workflow, Hammer];

export default function TechStackSection() {
  const sectionRef = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;
      const mm = gsap.matchMedia();

      mm.add(NO_MOTION_PREF, () => {
        const rows = gsap.utils.toArray<HTMLElement>(".tech-row", section);

        rows.forEach((row) => {
          gsap.from(row, {
            autoAlpha: 0,
            y: 48,
            duration: 0.9,
            ease: EASE.soft,
            scrollTrigger: { trigger: row, start: "top 82%" },
          });
          gsap.from(row.querySelectorAll(".tag"), {
            autoAlpha: 0,
            y: 14,
            stagger: 0.045,
            duration: 0.5,
            ease: EASE.soft,
            scrollTrigger: { trigger: row, start: "top 78%" },
          });
        });
      });

      /* gentle differential drift + hover wave, desktop only */
      mm.add(MM_DESKTOP, () => {
        const rows = gsap.utils.toArray<HTMLElement>(".tech-row", section);
        const cleanups: Array<() => void> = [];
        rows.forEach((row, index) => {
          gsap.to(row, {
            y: index % 2 ? -34 : -12,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top bottom",
              end: "bottom top",
              scrub: 1.2,
            },
          });
          const onEnter = () => {
            gsap.fromTo(
              row.querySelectorAll(".tag"),
              { y: 0 },
              {
                y: -8,
                duration: 0.2,
                stagger: 0.028,
                yoyo: true,
                repeat: 1,
                ease: "power2.out",
                overwrite: "auto",
              },
            );
          };
          row.addEventListener("pointerenter", onEnter);
          cleanups.push(() => row.removeEventListener("pointerenter", onEnter));
        });
        return () => cleanups.forEach((cleanup) => cleanup());
      });
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} className="tech section" id="stack" aria-labelledby="tech-title">
      <div className="section-inner">
        <p className="eyebrow">Tech Stack</p>
        <AnimatedHeadline as="h2" id="tech-title" className="section-title tech-title">
          Tools I use to build.
        </AnimatedHeadline>
        <div className="tech-rows">
          {techGroups.map((group, index) => {
            const Icon = GROUP_ICONS[index];
            return (
              <div key={group.label} className="tech-row">
                <h3 className="tech-label">
                  <Icon aria-hidden="true" />
                  {group.label}
                </h3>
                <ul className="tech-items" aria-label={group.label}>
                  {group.items.map((item) => (
                    <li key={item} className="tag">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
