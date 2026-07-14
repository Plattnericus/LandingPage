"use client";

import { useEffect, useRef } from "react";
import { ArrowUpRight, Code } from "lucide-react";
import { EASE, NO_MOTION_PREF, gsap, useGSAP } from "@/lib/animation";
import NexorWordmark from "@/components/brand/NexorWordmark";
import { useSmoothScroll } from "@/components/providers/SmoothScrollProvider";
import { siteConfig } from "@/lib/site";

export default function Hero() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const revealRef = useRef<gsap.core.Timeline | null>(null);
  const revealRequestedRef = useRef(false);
  const { introDone } = useSmoothScroll();

  /* Everything is built ONCE, paused, at mount — the intro loader only calls
     .play() later. Rebuilding on a dependency change proved fragile (the
     recreated context killed the running tweens). */
  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;
      const mm = gsap.matchMedia();

      mm.add(NO_MOTION_PREF, () => {
        const hwLetters = section.querySelectorAll(".hw-letter");
        const hsLetters = section.querySelectorAll(".hs-letter");
        const bottom = section.querySelectorAll(".hero-bottom > *");

        /* hidden until the loader hands off, without any flash */
        gsap.set(hwLetters, { yPercent: 112 });
        gsap.set(hsLetters, { yPercent: 118 });
        gsap.set(bottom, { autoAlpha: 0 });

        /* letters pull up out of their masks in two alternating waves,
           like the lenis.dev hero reveal */
        const tl = gsap.timeline({ paused: true, defaults: { ease: EASE.appleOut } });
        tl.to(
          hwLetters,
          {
            yPercent: 0,
            duration: 1.05,
            stagger: (i) => (i % 2 === 0 ? 0 : 0.14) + i * 0.03,
          },
          0.05,
        )
          .to(
            hsLetters,
            {
              yPercent: 0,
              duration: 0.75,
              stagger: (i) => (i % 2 === 0 ? 0 : 0.09) + i * 0.016,
            },
            0.45,
          )
          .to(
            bottom,
            { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.09, startAt: { y: 26 } },
            0.9,
          );
        revealRef.current = tl;
        if (revealRequestedRef.current) tl.play();

        /* wordmark drifts up slightly as you leave the hero */
        gsap.to(".hero-mark-wrap", {
          yPercent: -14,
          autoAlpha: 0.25,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom top",
            scrub: 1,
          },
        });

        return () => {
          if (revealRef.current === tl) revealRef.current = null;
        };
      });

      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  useEffect(() => {
    const reveal = () => {
      revealRequestedRef.current = true;
      revealRef.current?.play();
    };

    window.addEventListener("intro-reveal", reveal);
    if (introDone) reveal();

    return () => window.removeEventListener("intro-reveal", reveal);
  }, [introDone]);

  const scrollToProjects = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    document.querySelector("#work")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section ref={sectionRef} className="hero" aria-label="Intro">
      <div className="hero-mark-wrap">
        <h1 className="sr-only">Nexor — fullstack developer</h1>
        <p className="hero-wordmark" aria-hidden="true">
          <NexorWordmark variant="hero" />
        </p>
        <p className="hero-sub" aria-hidden="true">
          {"FULLSTACK DEVELOPER".split("").map((letter, index) => (
            <span className="hs-mask" key={index}>
              <span className="hs-letter">{letter === " " ? "\u00A0" : letter}</span>
            </span>
          ))}
        </p>
      </div>

      <div className="hero-bottom">
        <p className="hero-cue" aria-hidden="true">
          Scroll
          <br />
          to explore
        </p>
        <p className="hero-by">
          Fullstack · DevOps · Security
          <br />
          by{" "}
          <a href={siteConfig.github} target="_blank" rel="noreferrer">
            Nexor / Plattnericus
          </a>
        </p>
        <div className="hero-actions">
          <a className="pill" href={siteConfig.github} target="_blank" rel="noreferrer">
            <span className="pill-icon">
              <Code aria-hidden="true" />
            </span>
            <span className="pill-label">GitHub</span>
          </a>
          <a className="pill" href="#work" onClick={scrollToProjects}>
            <span className="pill-icon">
              <ArrowUpRight aria-hidden="true" />
            </span>
            <span className="pill-label">Projects</span>
          </a>
        </div>
      </div>
    </section>
  );
}
