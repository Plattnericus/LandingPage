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
        gsap.set(".dock-dot", { autoAlpha: 1, scale: 0 });
        gsap.set(".menu-item, .menu-glyph, .macdesk-clock", { autoAlpha: 0, y: -8 });
        gsap.set(".win-row, .tool-tile", { autoAlpha: 0, x: -12 });
        gsap.set(".pv-nav", { scaleX: 0, transformOrigin: "0 50%" });
        gsap.set(".pv-heroblock", { autoAlpha: 0, scaleY: 0.2, transformOrigin: "50% 0" });
        gsap.set(".pv-card", { autoAlpha: 0, y: 14, scale: 0.9 });
        gsap.set(".term-out-1, .term-out-2, .term-line-2", { autoAlpha: 0 });
        gsap.set(".mac-cursor", { autoAlpha: 0, left: "58%", top: "58%" });
        gsap.set(".macdesk-spotlight", { autoAlpha: 0, y: -16, scale: 0.96 });
        gsap.set(".macdesk-notif", { autoAlpha: 0, x: 60 });
        gsap.set(".music-progress-fill", { scaleX: 0, transformOrigin: "0 50%" });
        gsap.set(".sd-vignette", { autoAlpha: 0 });

        /* idle motion while pinned: wallpaper breath, window float, eq dance */
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
          ...gsap.utils.toArray<HTMLElement>(".eq-bar", section).map((bar, index) =>
            gsap.fromTo(
              bar,
              { scaleY: 0.25 },
              {
                scaleY: 1,
                transformOrigin: "50% 100%",
                duration: 0.42 + (index % 3) * 0.16,
                ease: "sine.inOut",
                yoyo: true,
                repeat: -1,
                paused: true,
              },
            ),
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

        /* pointer click: ring ripple + tiny cursor dip */
        const clickAt = (at: number) => {
          tl.fromTo(
            ".cursor-ring",
            { scale: 0, autoAlpha: 0.9 },
            { scale: 2.6, autoAlpha: 0, duration: 0.45, ease: "power2.out", immediateRender: false },
            at,
          ).to(".mac-cursor", { scale: 0.82, duration: 0.09, yoyo: true, repeat: 1, ease: "power1.inOut" }, at);
        };

        /* boot: frame rises, menubar + dock wake up */
        tl.fromTo(
          ".sd-browser",
          { scale: 0.92, y: 54 },
          { scale: 1, y: 0, duration: 1.4, ease: "power2.out", immediateRender: false },
          0,
        )
          .to(".sd-lead, .sd-meta", { autoAlpha: 0.4, y: -12, duration: 1.1, ease: "power1.inOut" }, 0.4)
          .to(".sd-title", { autoAlpha: 0.85, scale: 0.94, transformOrigin: "0 50%", duration: 1.2, ease: "power1.inOut" }, 0.4)
          .to(".menu-item, .menu-glyph, .macdesk-clock", { autoAlpha: 1, y: 0, stagger: 0.06, duration: 0.4 }, 0.7)
          .to(".macdesk-dock", { autoAlpha: 1, y: 0, duration: 0.6 }, 1.0)
          .to(".dock-icon", { autoAlpha: 1, scale: 1, stagger: 0.07, duration: 0.45, ease: "back.out(2.2)" }, 1.1);

        /* the cursor wakes up and opens Files from the dock */
        tl.to(".mac-cursor", { autoAlpha: 1, duration: 0.3 }, 1.6)
          .to(".mac-cursor", { left: "40%", top: "87%", duration: 0.7, ease: "power2.inOut" }, 1.8);
        clickAt(2.55);
        tl.to(".dock-files", { y: -10, duration: 0.18, yoyo: true, repeat: 1, ease: "power2.out" }, 2.6)
          .to(".win-files", { autoAlpha: 1, scale: 1, y: 0, duration: 0.7, ease: "back.out(1.25)" }, 2.8)
          .to(".win-files .win-row", { autoAlpha: 1, x: 0, stagger: 0.1, duration: 0.4 }, 3.1);

        /* next click: the live preview window builds its page skeleton */
        tl.to(".mac-cursor", { left: "44.5%", top: "87%", duration: 0.5, ease: "power2.inOut" }, 3.6);
        clickAt(4.15);
        tl.to(".dock-globe", { y: -10, duration: 0.18, yoyo: true, repeat: 1, ease: "power2.out" }, 4.2)
          .to(".win-preview", { autoAlpha: 1, scale: 1, y: 0, duration: 0.75, ease: "back.out(1.2)" }, 4.4)
          .to(".win-files", { autoAlpha: 0.72, duration: 0.5 }, 4.5)
          .to(".pv-nav", { scaleX: 1, duration: 0.5, ease: "power2.out" }, 4.75)
          .to(".pv-heroblock", { autoAlpha: 1, scaleY: 1, duration: 0.6, ease: "power2.out" }, 4.95)
          .to(".pv-card", { autoAlpha: 1, y: 0, scale: 1, stagger: 0.12, duration: 0.45, ease: "back.out(1.6)" }, 5.3);

        /* ⌘space — spotlight summons the terminal */
        tl.to(".mac-cursor", { left: "52%", top: "42%", duration: 0.6, ease: "power2.inOut" }, 5.9)
          .to(".macdesk-spotlight", { autoAlpha: 1, y: 0, scale: 1, duration: 0.5, ease: "back.out(1.4)" }, 6.3)
          .to(".spot-text", { text: "terminal", duration: 0.7, ease: "none" }, 6.7)
          .to(".macdesk-spotlight", { autoAlpha: 0, y: -12, scale: 0.97, duration: 0.4 }, 7.7);

        /* terminal boots the dev server, then ships it */
        tl.to(".win-terminal", { autoAlpha: 1, scale: 1, y: 0, duration: 0.7, ease: "back.out(1.25)" }, 7.9)
          .to(".win-preview", { autoAlpha: 0.85, duration: 0.5 }, 8.0)
          .to(".dock-dot", { scale: 1, duration: 0.3, ease: "back.out(3)" }, 8.1)
          .to(".term-cmd-1", { text: "npm run dev", duration: 0.9, ease: "none" }, 8.3)
          .to(".term-out-1", { autoAlpha: 1, duration: 0.15 }, 9.3)
          .to(
            ".term-out-1",
            {
              scrambleText: { text: "ready in 412ms", chars: "lowerCase", speed: 0.6 },
              duration: 0.7,
              ease: "none",
            },
            9.35,
          )
          .to(".term-caret-1", { autoAlpha: 0, duration: 0.1 }, 10.15)
          .to(".term-line-2", { autoAlpha: 1, duration: 0.15 }, 10.2)
          .to(".term-cmd-2", { text: "docker compose up -d", duration: 1.0, ease: "none" }, 10.35)
          .to(".macdesk-clock", { text: "09:42", duration: 0.2, ease: "none" }, 11.3)
          .to(".term-out-2", { autoAlpha: 1, duration: 0.15 }, 11.45)
          .to(
            ".term-out-2",
            {
              scrambleText: { text: "✓ 3 services healthy", chars: "lowerCase", speed: 0.6 },
              duration: 0.7,
              ease: "none",
            },
            11.5,
          );

        /* deploy notification + music widget + tools join the desktop */
        tl.to(".macdesk-notif", { autoAlpha: 1, x: 0, duration: 0.6, ease: "back.out(1.5)" }, 12.3)
          .to(".macdesk-notif", { autoAlpha: 0, x: 40, duration: 0.5, ease: "power2.in" }, 14.0);
        tl.to(".mac-cursor", { left: "54.5%", top: "87%", duration: 0.6, ease: "power2.inOut" }, 12.0);
        clickAt(12.65);
        tl.to(".dock-music", { y: -10, duration: 0.18, yoyo: true, repeat: 1, ease: "power2.out" }, 12.7)
          .to(".win-music", { autoAlpha: 1, scale: 1, y: 0, duration: 0.65, ease: "back.out(1.3)" }, 12.9)
          .to(".music-progress-fill", { scaleX: 0.72, duration: 3.4, ease: "none" }, 13.2);
        tl.to(".win-tools", { autoAlpha: 1, scale: 1, y: 0, duration: 0.7, ease: "back.out(1.25)" }, 13.3)
          .to(".win-tools .tool-tile", { autoAlpha: 1, x: 0, stagger: 0.09, duration: 0.4 }, 13.6);

        /* mission control: every window fans out, then settles back */
        const spread: Array<[string, number, number]> = [
          [".win-files", -26, -18],
          [".win-preview", 30, -16],
          [".win-terminal", 0, 26],
          [".win-tools", -30, 20],
          [".win-music", 30, 22],
        ];
        spread.forEach(([selector, x, y]) => {
          tl.to(selector, { x, y, scale: 0.94, autoAlpha: 1, duration: 0.9, ease: "power2.inOut" }, 14.6);
          tl.to(selector, { x: 0, y: 0, scale: 1, duration: 0.9, ease: "power2.inOut" }, 16.1);
        });
        tl.to(".mac-cursor", { autoAlpha: 0, duration: 0.4 }, 14.6)
          .to(".macdesk-wall", { autoAlpha: 0.72, duration: 0.9, ease: "power2.inOut" }, 14.6)
          .to(".macdesk-wall", { autoAlpha: 1, duration: 0.9, ease: "power2.inOut" }, 16.1);

        /* settle */
        tl.to(".sd-browser", { scale: 0.985, duration: 1.0, ease: "power2.inOut" }, 17.2)
          .to(".sd-vignette", { autoAlpha: 1, duration: 1.0 }, 17.2)
          .to({}, { duration: 0.8 });
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
