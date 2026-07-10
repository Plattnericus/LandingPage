"use client";

import { useRef } from "react";
import AnimatedHeadline from "@/components/motion/AnimatedHeadline";
import LiquidBlob from "@/components/motion/LiquidBlob";
import { NO_MOTION_PREF, SplitText, gsap, useGSAP } from "@/lib/animation";

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
        /* word-by-word brighten while scrolling through */
        const body = section.querySelector<HTMLElement>(".statement-body");
        const bodySplit = body ? SplitText.create(body, { type: "words" }) : null;
        if (bodySplit) {
          gsap.fromTo(
            bodySplit.words,
            { opacity: 0.22, yPercent: 14 },
            {
              opacity: 1,
              yPercent: 0,
              stagger: 0.06,
              ease: "none",
              immediateRender: false,
              scrollTrigger: {
                trigger: body,
                start: "top 78%",
                end: "top 30%",
                scrub: 1,
              },
            },
          );
        }

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

        return () => bodySplit?.revert();
      });
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} className="statement section" aria-labelledby="statement-title">
      <div className="statement-light" aria-hidden="true" />
      <LiquidBlob className="liquid-statement" strength={0.2} />
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
