"use client";

import { useEffect, useRef } from "react";
import { ArrowRight, GitBranch, Mail } from "lucide-react";
import LiquidBlob from "@/components/motion/LiquidBlob";
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

        /* ------------------------------------------------------------ */
        /* Entrance — played on intro handoff                            */
        /* ------------------------------------------------------------ */
        const split = SplitText.create(title, { type: "chars" });
        const entrance = gsap.timeline({ paused: true });
        entrance
          .fromTo(
            title,
            { autoAlpha: 0, filter: "blur(16px)" },
            { autoAlpha: 1, filter: "blur(0px)", duration: 1.0, ease: EASE.out },
            0,
          )
          .fromTo(
            split.chars,
            { yPercent: 120, rotationX: -85, autoAlpha: 0 },
            {
              yPercent: 0,
              rotationX: 0,
              autoAlpha: 1,
              duration: 1.1,
              stagger: { each: 0.06, from: "center" },
              ease: "back.out(1.4)",
            },
            0.05,
          )
          .fromTo(
            ".hero-eyebrow",
            { autoAlpha: 0, letterSpacing: "0.6em" },
            { autoAlpha: 1, letterSpacing: "0.28em", duration: 0.9, ease: EASE.out },
            0.15,
          )
          .fromTo(
            ".hero-halo",
            { autoAlpha: 0, scale: 0.72 },
            { autoAlpha: 1, scale: 1, duration: 1.3, ease: EASE.soft },
            0.2,
          )
          .fromTo(
            ".hero-role",
            { autoAlpha: 0, y: 24, filter: "blur(6px)" },
            { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.8, ease: EASE.out },
            0.34,
          )
          .fromTo(
            ".hero-lead",
            { autoAlpha: 0, y: 26 },
            { autoAlpha: 1, y: 0, duration: 0.8, ease: EASE.out },
            0.46,
          )
          .fromTo(
            ".hero-actions .btn",
            { autoAlpha: 0, y: 30, scale: 0.92 },
            { autoAlpha: 1, y: 0, scale: 1, duration: 0.8, stagger: 0.09, ease: "back.out(1.6)" },
            0.56,
          )
          .fromTo(
            ".hero-orbit",
            { autoAlpha: 0, scale: 0 },
            { autoAlpha: 1, scale: 1, duration: 0.85, stagger: 0.07, ease: "back.out(1.8)" },
            0.72,
          )
          .fromTo(".hero-scroll-cue", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6 }, 1.0)
          .to(
            title,
            { textShadow: "0 0 90px rgba(221, 184, 146, 0.55)", duration: 0.5, ease: "power2.out" },
            1.12,
          )
          .to(
            title,
            { textShadow: "0 0 36px rgba(221, 184, 146, 0.2)", duration: 1.0, ease: "power2.inOut" },
            1.62,
          );
        entranceRef.current = entrance;
        if (!isDesktop) {
          /* mobile: play right away under the intro overlay — no handoff race */
          entrance.play();
        } else if (introDoneRef.current) {
          /* context rebuilt after the intro already finished → land on end state */
          entrance.progress(1);
        }

        /* char hover jiggle (desktop pointers) */
        const charCleanups: Array<() => void> = [];
        if (isDesktop) {
          split.chars.forEach((char) => {
            const el = char as HTMLElement;
            const onEnter = () => {
              gsap.to(el, {
                y: -18,
                scale: 1.14,
                rotation: gsap.utils.random(-7, 7),
                duration: 0.26,
                ease: "power2.out",
                overwrite: "auto",
                onComplete: () =>
                  gsap.to(el, { y: 0, scale: 1, rotation: 0, duration: 0.9, ease: "elastic.out(1, 0.4)" }),
              });
            };
            el.addEventListener("pointerenter", onEnter);
            charCleanups.push(() => el.removeEventListener("pointerenter", onEnter));
          });

          /* mouse spotlight follows the pointer across the hero */
          const spot = section.querySelector<HTMLElement>(".hero-spot");
          if (spot) {
            const onSpot = (event: PointerEvent) => {
              const rect = section.getBoundingClientRect();
              spot.style.setProperty("--mx", `${event.clientX - rect.left}px`);
              spot.style.setProperty("--my", `${event.clientY - rect.top}px`);
            };
            section.addEventListener("pointermove", onSpot);
            charCleanups.push(() => section.removeEventListener("pointermove", onSpot));
          }
        }

        /* ------------------------------------------------------------ */
        /* Ambient infinite motion (composes with depth + entrance)      */
        /* ------------------------------------------------------------ */
        gsap.to(".orbit-spin", { rotation: 360, duration: 52, ease: "none", repeat: -1 });
        gsap.to(".hero-halo", { rotation: 360, duration: 64, ease: "none", repeat: -1 });
        gsap.utils.toArray<HTMLElement>(".hero-orbit", section).forEach((orbit, index) => {
          gsap.to(orbit, {
            yPercent: 26 + ((index * 17) % 44),
            duration: 3.8 + index * 0.7,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
          });
        });

        /* ------------------------------------------------------------ */
        /* Pinned scroll story: Build. Deploy. Secure.                   */
        /* All scrubbed tweens use explicit fromTo values with           */
        /* immediateRender: false so scrolling back up always restores   */
        /* the true resting state (never a mid-entrance snapshot).       */
        /* ------------------------------------------------------------ */
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
            onUpdate: (self) => {
              const tl = entranceRef.current;
              if (self.progress > 0.01 && tl && tl.progress() < 1) tl.progress(1);
            },
          },
        });

        pinTl
          .fromTo(
            ".hero-scroll-cue",
            { autoAlpha: 1 },
            { autoAlpha: 0, duration: 0.4, immediateRender: false },
            0,
          )
          .fromTo(
            title,
            { scale: 1, autoAlpha: 1 },
            { scale: 0.75, autoAlpha: 0.22, duration: 2, ease: "power1.in", immediateRender: false },
            0,
          )
          .fromTo(
            ".hero-eyebrow, .hero-role, .hero-lead, .hero-actions",
            { autoAlpha: 1, y: 0 },
            { autoAlpha: 0.1, y: -30, duration: 2, ease: "power1.in", immediateRender: false },
            0,
          )
          .fromTo(
            ".hero-halo",
            { autoAlpha: 1, scale: 1 },
            { autoAlpha: 0.14, scale: 1.18, duration: 2.2, ease: "power1.in", immediateRender: false },
            0,
          )
          .fromTo(
            ".hero-orbit",
            { autoAlpha: 1, scale: 1 },
            {
              autoAlpha: 0,
              scale: 1.5,
              duration: 1.7,
              stagger: 0.05,
              ease: "power1.in",
              immediateRender: false,
            },
            0,
          )
          .fromTo(
            ".liquid-hero",
            { autoAlpha: 1, scale: 1 },
            { autoAlpha: 0.15, scale: 1.25, duration: 2.2, ease: "power1.in", immediateRender: false },
            0,
          );

        /* clean masked roll for Build. / Deploy. / Secure. — chars rise out
           of a clipping mask, hold their dwell, then roll up and away.
           No rotation, no scatter: one crisp line per word. */
        const wordSplits = words.map((word) =>
          SplitText.create(word, { type: "chars", mask: "chars" }),
        );
        const glowByWord = [".hero-glow-tan", ".hero-glow-sand", ".hero-glow-copper"];
        words.forEach((word, index) => {
          const chars = wordSplits[index].chars;
          const at = 2.4 + index * 3.7;
          pinTl
            .fromTo(
              word,
              { autoAlpha: 0 },
              { autoAlpha: 1, duration: 0.25, ease: "none", immediateRender: false },
              at,
            )
            .fromTo(
              chars,
              { yPercent: 110 },
              {
                yPercent: 0,
                duration: 0.8,
                stagger: 0.035,
                ease: "power4.out",
                immediateRender: false,
              },
              at,
            );
          if (index > 0) {
            pinTl.fromTo(
              glowByWord[index - 1],
              { autoAlpha: 1 },
              { autoAlpha: 0, duration: 1.4, immediateRender: false },
              at - 0.4,
            );
            pinTl.fromTo(
              glowByWord[index],
              { autoAlpha: 0 },
              { autoAlpha: 1, duration: 1.4, immediateRender: false },
              at - 0.2,
            );
          }
          if (index < words.length - 1) {
            pinTl
              .to(
                chars,
                {
                  yPercent: -110,
                  duration: 0.6,
                  stagger: 0.03,
                  ease: "power3.in",
                },
                at + 2.9,
              )
              .to(word, { autoAlpha: 0, duration: 0.2, ease: "none" }, at + 3.5);
          }
        });
        pinTl.to({}, { duration: 1.8 });

        return () => {
          entranceRef.current = null;
          charCleanups.forEach((cleanup) => cleanup());
          wordSplits.forEach((wordSplit) => wordSplit.revert());
          split.revert();
        };
      });
    },
    { scope: sectionRef },
  );

  useEffect(() => {
    introDoneRef.current = introDone;
    if (!introDone) return;
    entranceRef.current?.play();
    /* fail-safe: never leave the hero half-hidden if the timeline got
       interrupted (context re-init, tab switch, …) */
    const guard = gsap.delayedCall(3, () => {
      const timeline = entranceRef.current;
      if (timeline && timeline.progress() < 1 && !timeline.isActive()) timeline.progress(1);
    });
    return () => {
      guard.kill();
    };
  }, [introDone]);

  return (
    <section ref={sectionRef} className="hero section" aria-labelledby="hero-title">
      <div className="hero-glows" data-depth="26" aria-hidden="true">
        <div className="hero-glow hero-glow-tan" />
        <div className="hero-glow hero-glow-sand" />
        <div className="hero-glow hero-glow-copper" />
      </div>
      <LiquidBlob className="liquid-hero" strength={0.3} goo />
      <div className="hero-spot" aria-hidden="true" />
      <div className="hero-halo" aria-hidden="true" />
      <div className="hero-orbits" aria-hidden="true">
        <span className="hero-orbit orbit-ring orbit-spin orbit-a" data-depth="30" />
        <span className="hero-orbit orbit-ring orbit-b" data-depth="16" />
        <span className="hero-orbit orbit-orb orbit-c" data-depth="24" />
        <span className="hero-orbit orbit-orb orbit-d" data-depth="12" />
        <span className="hero-orbit orbit-cross orbit-e" data-depth="34" />
        <span className="hero-orbit orbit-dot orbit-f" data-depth="10" />
        <span className="hero-orbit orbit-dashed orbit-spin orbit-g" data-depth="20" />
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
