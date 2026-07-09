"use client";

import { useRef } from "react";
import AnimatedHeadline from "@/components/motion/AnimatedHeadline";
import { MM_DESKTOP, MM_MOBILE, PIN, SplitText, gsap, useGSAP } from "@/lib/animation";
import { futureWords } from "@/lib/content";

export default function FutureVision() {
  const sectionRef = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;
      const mm = gsap.matchMedia();

      mm.add({ desktop: MM_DESKTOP, mobile: MM_MOBILE }, (ctx) => {
        const isDesktop = Boolean(ctx.conditions?.desktop);
        const words = gsap.utils.toArray<HTMLElement>(".future-word", section);
        const strong = section.querySelector<HTMLElement>(".future-strong");
        const split = strong ? SplitText.create(strong, { type: "words", mask: "words" }) : null;

        const tl = gsap.timeline({
          defaults: { ease: "power2.out" },
          scrollTrigger: {
            id: "future",
            trigger: section,
            start: "top top",
            end: `+=${isDesktop ? PIN.future : Math.round(PIN.future * 0.6)}`,
            scrub: 1,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        tl.fromTo(
          ".future-head",
          { autoAlpha: 1, y: 0 },
          { autoAlpha: 0.16, y: -34, duration: 1.4, ease: "power1.in", immediateRender: false },
          0.2,
        );

        words.forEach((word, index) => {
          const at = 1.5 + index * 2.1;
          tl.fromTo(
            word,
            { autoAlpha: 0, y: 80, scale: 0.94, filter: "blur(18px)" },
            {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              filter: "blur(0px)",
              duration: 1.0,
              ease: "power2.out",
              immediateRender: false,
            },
            at,
          );
          if (index < words.length - 1) {
            tl.to(
              word,
              { autoAlpha: 0, y: -80, scale: 1.05, filter: "blur(18px)", duration: 1.0, ease: "power2.in" },
              at + 1.4,
            );
          } else {
            tl.to(
              word,
              { autoAlpha: 0.14, scale: 1.6, filter: "blur(10px)", duration: 1.4, ease: "power2.inOut" },
              at + 1.5,
            );
          }
        });

        if (split) {
          tl.fromTo(
            split.words,
            { yPercent: 120 },
            { yPercent: 0, stagger: 0.09, duration: 0.9, ease: "power3.out", immediateRender: false },
            10.2,
          );
        }
        tl.fromTo(
          ".future-dark",
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 2.4, ease: "none", immediateRender: false },
          9.4,
        ).to({}, { duration: 0.8 });

        return () => split?.revert();
      });
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} className="future section" id="future" aria-labelledby="future-title">
      <div className="future-dark" aria-hidden="true" />
      <div className="section-inner future-inner">
        <div className="future-head narrow">
          <p className="eyebrow">Future Vision</p>
          <AnimatedHeadline as="h2" id="future-title" className="section-title">
            Where I am heading.
          </AnimatedHeadline>
          <p className="body future-lead">
            I want to become the type of engineer who can understand the full lifecycle of
            software: designing the interface, building the backend, deploying the system,
            operating the infrastructure and securing everything behind it.
          </p>
        </div>
        <div className="future-words" aria-hidden="true">
          {futureWords.map((word) => (
            <span key={word} className="future-word display-word">
              {word}
            </span>
          ))}
        </div>
        <p className="future-strong strong-line">Build systems. Deploy them. Secure them.</p>
      </div>
    </section>
  );
}
