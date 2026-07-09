"use client";

import { useRef } from "react";
import { ArrowUpRight, Star } from "lucide-react";
import AnimatedHeadline from "@/components/motion/AnimatedHeadline";
import MagneticButton from "@/components/motion/MagneticButton";
import { useDepth } from "@/components/motion/useDepth";
import DeviceMockup from "@/components/mockups/DeviceMockup";
import MacDesktop from "@/components/mockups/MacDesktop";
import { MM_DESKTOP, MM_MOBILE, PIN, gsap, useGSAP } from "@/lib/animation";
import { findRepoStats, formatRepoDate, type GithubSummary } from "@/lib/github";

export default function StreamDeckStory({ github }: { github: GithubSummary }) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const stats = findRepoStats(github, "StreamDeck");

  useDepth(sectionRef);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;
      const mm = gsap.matchMedia();

      mm.add({ desktop: MM_DESKTOP, mobile: MM_MOBILE }, (ctx) => {
        const isDesktop = Boolean(ctx.conditions?.desktop);

        if (!isDesktop) {
          gsap.from(".sd-stage", {
            autoAlpha: 0,
            y: 60,
            duration: 1.0,
            ease: "power3.out",
            scrollTrigger: { trigger: section, start: "top 62%" },
          });
          return;
        }

        /* resting states */
        gsap.set(".macdesk-window", { autoAlpha: 0, scale: 0.86, y: 30 });
        gsap.set(".macdesk-dock", { autoAlpha: 0, y: 18 });
        gsap.set(".dock-icon", { autoAlpha: 0, scale: 0 });
        gsap.set(".win-row, .tool-tile", { autoAlpha: 0, x: -12 });
        gsap.set(".term-out", { autoAlpha: 0 });
        gsap.set(".sd-vignette", { autoAlpha: 0 });

        /* idle motion while pinned: wallpaper breath + window hover-float */
        const idle = [
          gsap.to(".macdesk-wall", {
            scale: 1.06,
            duration: 9,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
            paused: true,
          }),
          ...gsap.utils.toArray<HTMLElement>(".macdesk-window", section).map((win, index) =>
            gsap.to(win, {
              yPercent: index % 2 ? -1.6 : 1.6,
              duration: 2.6 + index * 0.7,
              ease: "sine.inOut",
              yoyo: true,
              repeat: -1,
              paused: true,
            }),
          ),
          gsap.to(".tool-tile.is-accent", {
            opacity: 0.5,
            duration: 1.3,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
            paused: true,
          }),
        ];

        const tl = gsap.timeline({
          defaults: { ease: "power3.out" },
          scrollTrigger: {
            id: "streamdeck",
            trigger: section,
            start: "top top",
            end: `+=${PIN.streamdeck}`,
            scrub: 1,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onToggle: (self) =>
              idle.forEach((tween) => (self.isActive ? tween.play() : tween.pause())),
          },
        });

        tl.fromTo(
          ".sd-browser",
          { scale: 0.92, y: 54 },
          { scale: 1, y: 0, duration: 1.4, ease: "power2.out", immediateRender: false },
          0,
        );

        /* Files window */
        tl.to(".win-files", { autoAlpha: 1, scale: 1, y: 0, duration: 0.7, ease: "back.out(1.25)" }, 1.4)
          .to(".win-files .win-row", { autoAlpha: 1, x: 0, stagger: 0.1, duration: 0.4 }, 1.75);

        /* Tools window + dock */
        tl.to(".win-tools", { autoAlpha: 1, scale: 1, y: 0, duration: 0.7, ease: "back.out(1.25)" }, 2.7)
          .to(".win-tools .tool-tile", { autoAlpha: 1, x: 0, stagger: 0.09, duration: 0.4 }, 3.0)
          .to(".macdesk-dock", { autoAlpha: 1, y: 0, duration: 0.6 }, 3.1)
          .to(
            ".dock-icon",
            { autoAlpha: 1, scale: 1, stagger: 0.07, duration: 0.45, ease: "back.out(2.2)" },
            3.25,
          );

        /* Terminal types */
        tl.to(".win-terminal", { autoAlpha: 1, scale: 1, y: 0, duration: 0.7, ease: "back.out(1.25)" }, 4.1)
          .to(".term-cmd", { text: "npm run dev", duration: 0.9, ease: "none" }, 4.5)
          .to(".term-out", { autoAlpha: 1, duration: 0.15 }, 5.5)
          .to(
            ".term-out",
            {
              scrambleText: { text: "ready in 412ms", chars: "lowerCase", speed: 0.6 },
              duration: 0.7,
              ease: "none",
            },
            5.55,
          );

        /* settle */
        tl.to(".sd-browser", { scale: 0.985, duration: 1.0, ease: "power2.inOut" }, 6.6)
          .to(".sd-vignette", { autoAlpha: 1, duration: 1.0 }, 6.6)
          .to({}, { duration: 0.6 });
      });
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      className="streamdeck section"
      id="streamdeck"
      aria-labelledby="streamdeck-title"
    >
      <div className="section-inner sd-inner">
        <div className="sd-head">
          <p className="eyebrow">Case Study 02</p>
          <AnimatedHeadline as="h2" id="streamdeck-title" className="section-title sd-title">
            A browser desktop inspired by macOS.
          </AnimatedHeadline>
          <p className="body sd-lead">
            StreamDeck is an interactive web desktop with app-like windows, tools and a polished
            browser-based experience.
          </p>
          <div className="sd-meta">
            {stats ? (
              <p className="slide-stats">
                <Star aria-hidden="true" />
                {stats.stars} stars
                <span aria-hidden="true">·</span>
                {stats.language}
                <span aria-hidden="true">·</span>
                Updated {formatRepoDate(stats.pushedAt)}
              </p>
            ) : null}
            <div className="sd-actions">
              <MagneticButton
                href="https://streamdeck.plattnericus.dev/desktop"
                external
                variant="primary"
                icon={<ArrowUpRight aria-hidden="true" />}
              >
                Open Live
              </MagneticButton>
              <MagneticButton
                href="https://github.com/Plattnericus/StreamDeck"
                external
                icon={<ArrowUpRight aria-hidden="true" />}
              >
                View on GitHub
              </MagneticButton>
            </div>
          </div>
        </div>
        <div className="sd-stage">
          <DeviceMockup variant="browser" className="sd-browser" url="streamdeck.plattnericus.dev/desktop">
            <MacDesktop />
            <div className="sd-vignette" aria-hidden="true" />
          </DeviceMockup>
        </div>
      </div>
    </section>
  );
}
