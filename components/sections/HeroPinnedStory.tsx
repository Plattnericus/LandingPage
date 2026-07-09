"use client";

import { useEffect, useRef } from "react";
import { ArrowRight, GitBranch, Mail } from "lucide-react";
import MagneticButton from "@/components/motion/MagneticButton";
import { useDepth } from "@/components/motion/useDepth";
import { useSmoothScroll } from "@/components/providers/SmoothScrollProvider";
import { EASE, MM_DESKTOP, MM_MOBILE, PIN, SplitText, gsap, useGSAP } from "@/lib/animation";
import { heroWords } from "@/lib/content";
import { siteConfig } from "@/lib/site";

export default function HeroPinnedStory() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const entranceRef = useRef<gsap.core.Timeline | null>(null);
  const { introDone } = useSmoothScroll();
  const introDoneRef = useRef(false);

  useDepth(sectionRef);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;
      const mm = gsap.matchMedia();

      mm.add({ desktop: MM_DESKTOP, mobile: MM_MOBILE }, (ctx) => {
        const isDesktop = Boolean(ctx.conditions?.desktop);
        const title = section.querySelector<HTMLElement>(".hero-title");
        if (!title) return;

        /* --- entrance, played on intro handoff --- */
        const split = SplitText.create(title, { type: "chars" });
        const entrance = gsap.timeline({ paused: true });
        entrance
          .fromTo(
            title,
            { autoAlpha: 0, filter: "blur(14px)" },
            { autoAlpha: 1, filter: "blur(0px)", duration: 0.9, ease: EASE.out },
            0,
          )
          .fromTo(
            split.chars,
            { yPercent: 68, autoAlpha: 0 },
            { yPercent: 0, autoAlpha: 1, duration: 0.95, stagger: 0.05, ease: EASE.out },
            0.05,
          )
          .fromTo(
            ".hero-eyebrow",
            { autoAlpha: 0, y: 18 },
            { autoAlpha: 1, y: 0, duration: 0.7, ease: EASE.out },
            0.12,
          )
          .fromTo(
            ".hero-role",
            { autoAlpha: 0, y: 22 },
            { autoAlpha: 1, y: 0, duration: 0.75, ease: EASE.out },
            0.3,
          )
          .fromTo(
            ".hero-lead",
            { autoAlpha: 0, y: 24 },
            { autoAlpha: 1, y: 0, duration: 0.8, ease: EASE.out },
            0.42,
          )
          .fromTo(
            ".hero-actions .btn",
            { autoAlpha: 0, y: 26 },
            { autoAlpha: 1, y: 0, duration: 0.75, stagger: 0.08, ease: EASE.out },
            0.52,
          )
          .fromTo(".hero-scroll-cue", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6 }, 0.95);
        entranceRef.current = entrance;
        if (introDoneRef.current) entrance.play(0);

        /* --- pinned scroll story: Build. Deploy. Secure. --- */
        const words = gsap.utils.toArray<HTMLElement>(".hero-word", section);
        const pinTl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            id: "hero",
            trigger: section,
            start: "top top",
            end: `+=${isDesktop ? PIN.hero : PIN.heroMobile}`,
            scrub: 1,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        pinTl
          .to(".hero-scroll-cue", { autoAlpha: 0, duration: 0.4 }, 0)
          .to(title, { scale: 0.75, autoAlpha: 0.22, duration: 2, ease: "power1.in" }, 0)
          .to(
            ".hero-eyebrow, .hero-role, .hero-lead, .hero-actions",
            { autoAlpha: 0.1, y: -28, duration: 2, ease: "power1.in" },
            0,
          );

        const glowByWord = [".hero-glow-tan", ".hero-glow-sand", ".hero-glow-copper"];
        words.forEach((word, index) => {
          const at = 2.4 + index * 3.2;
          pinTl.fromTo(
            word,
            { autoAlpha: 0, y: 90, filter: "blur(16px)" },
            { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 1.1, ease: "power2.out" },
            at,
          );
          if (index > 0) {
            pinTl.to(glowByWord[index - 1], { autoAlpha: 0, duration: 1.4 }, at - 0.4);
            pinTl.to(glowByWord[index], { autoAlpha: 1, duration: 1.4 }, at - 0.2);
          }
          if (index < words.length - 1) {
            pinTl.to(
              word,
              { autoAlpha: 0, y: -90, filter: "blur(16px)", duration: 1.1, ease: "power2.in" },
              at + 2.1,
            );
          }
        });
        pinTl.to({}, { duration: 1.6 });

        return () => {
          entranceRef.current = null;
          split.revert();
        };
      });
    },
    { scope: sectionRef },
  );

  useEffect(() => {
    introDoneRef.current = introDone;
    if (introDone) entranceRef.current?.play();
  }, [introDone]);

  return (
    <section
      ref={sectionRef}
      className="hero section"
      aria-labelledby="hero-title"
    >
      <div className="hero-glows" data-depth="26" aria-hidden="true">
        <div className="hero-glow hero-glow-tan" />
        <div className="hero-glow hero-glow-sand" />
        <div className="hero-glow hero-glow-copper" />
      </div>
      <div className="hero-inner section-inner">
        <p className="eyebrow hero-eyebrow">plattnericus.dev</p>
        <h1 className="hero-title" id="hero-title" data-depth="9">
          Nexor
        </h1>
        <p className="hero-role">
          Fullstack Developer · DevOps Enthusiast · Cybersecurity in Progress
        </p>
        <p className="body hero-lead">
          Building reliable software, infrastructure and security-focused systems.
        </p>
        <div className="hero-actions">
          <MagneticButton href="#projects" variant="primary" icon={<ArrowRight aria-hidden="true" />}>
            View Projects
          </MagneticButton>
          <MagneticButton href={siteConfig.github} external icon={<GitBranch aria-hidden="true" />}>
            GitHub
          </MagneticButton>
          <MagneticButton href="#contact" icon={<Mail aria-hidden="true" />}>
            Contact
          </MagneticButton>
        </div>
      </div>
      <div className="hero-words" aria-hidden="true">
        {heroWords.map((word) => (
          <span key={word} className="hero-word display-word">
            {word}
          </span>
        ))}
      </div>
      <div className="hero-scroll-cue" aria-hidden="true">
        <span />
        Scroll
      </div>
    </section>
  );
}
