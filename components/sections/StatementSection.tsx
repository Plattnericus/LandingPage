"use client";

import { useRef } from "react";
import AnimatedHeadline from "@/components/motion/AnimatedHeadline";
import { EASE, NO_MOTION_PREF, gsap, useGSAP } from "@/lib/animation";

export default function StatementSection() {
  const sectionRef = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;
      const mm = gsap.matchMedia();

      mm.add(NO_MOTION_PREF, () => {
        gsap.fromTo(
          ".statement-light",
          { opacity: 0 },
          {
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top 70%",
              end: "center center",
              scrub: 1,
            },
          },
        );
        gsap.from(".statement-body", {
          autoAlpha: 0,
          y: 30,
          duration: 1.0,
          ease: EASE.soft,
          scrollTrigger: { trigger: section, start: "top 55%" },
        });
      });
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} className="statement section" aria-labelledby="statement-title">
      <div className="statement-light" aria-hidden="true" />
      <div className="section-inner narrow">
        <AnimatedHeadline as="h2" id="statement-title" className="section-title" mode="scrub-blur">
          I build things that actually run.
        </AnimatedHeadline>
        <p className="body statement-body">
          I am a student developer from South Tyrol, building web apps, tools and self-hosted
          systems. I like working across the full stack: from clean interfaces and APIs to Linux
          servers, Docker deployments and infrastructure.
        </p>
      </div>
    </section>
  );
}
