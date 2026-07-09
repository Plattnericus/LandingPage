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
        gsap.from(".statement-float", {
          autoAlpha: 0,
          scale: 0,
          stagger: 0.12,
          duration: 0.9,
          ease: "back.out(1.8)",
          scrollTrigger: { trigger: section, start: "top 60%" },
        });
        gsap.utils.toArray<HTMLElement>(".statement-float", section).forEach((el, index) => {
          gsap.to(el, {
            yPercent: 34 + index * 18,
            duration: 4.4 + index,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
          });
        });
      });
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} className="statement section" aria-labelledby="statement-title">
      <div className="statement-light" aria-hidden="true" />
      <span className="statement-float orbit-orb stmt-float-a" aria-hidden="true" />
      <span className="statement-float orbit-ring stmt-float-b" aria-hidden="true" />
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
