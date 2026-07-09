"use client";

import { useRef } from "react";
import { ArrowLeft, GitBranch } from "lucide-react";
import AmbientBackground from "@/components/motion/AmbientBackground";
import CursorGlow from "@/components/motion/CursorGlow";
import LiquidBlob from "@/components/motion/LiquidBlob";
import MagneticButton from "@/components/motion/MagneticButton";
import { useDepth } from "@/components/motion/useDepth";
import { EASE, NO_MOTION_PREF, SplitText, gsap, useGSAP } from "@/lib/animation";
import { siteConfig } from "@/lib/site";

const STATUS_LINES = [
  "GET /this-route → 404 · tunnel not found",
  "traceroute: lost somewhere after cloudflare",
  "docker ps: no container serves this path",
  "nginx: location / { try_files … } → nothing",
];

export default function NotFound() {
  const rootRef = useRef<HTMLElement | null>(null);

  useDepth(rootRef);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const mm = gsap.matchMedia();

      mm.add(NO_MOTION_PREF, () => {
        const code = root.querySelector<HTMLElement>(".nf-code");
        const split = code ? SplitText.create(code, { type: "chars" }) : null;

        const tl = gsap.timeline();
        tl.fromTo(
          ".nf-eyebrow",
          { autoAlpha: 0, letterSpacing: "0.55em" },
          { autoAlpha: 1, letterSpacing: "0.28em", duration: 0.8, ease: EASE.out },
          0,
        );
        if (split) {
          tl.fromTo(
            split.chars,
            { yPercent: -130, rotationX: 65, autoAlpha: 0, transformPerspective: 700 },
            {
              yPercent: 0,
              rotationX: 0,
              autoAlpha: 1,
              duration: 1.1,
              stagger: 0.09,
              ease: "elastic.out(1, 0.5)",
            },
            0.15,
          );
        }
        tl.fromTo(
          ".nf-line",
          { autoAlpha: 0, y: 26, filter: "blur(8px)" },
          { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.8, ease: EASE.out },
          0.7,
        )
          .fromTo(
            ".nf-actions .btn",
            { autoAlpha: 0, y: 26, scale: 0.9 },
            { autoAlpha: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.1, ease: "back.out(1.7)" },
            1.1,
          )
          .fromTo(
            ".nf-el",
            { autoAlpha: 0, scale: 0 },
            { autoAlpha: 1, scale: 1, duration: 0.8, stagger: 0.08, ease: "back.out(2)" },
            1.0,
          );

        /* status line keeps rescanning forever */
        const statusEl = root.querySelector<HTMLElement>(".nf-status");
        if (statusEl) {
          const loop = gsap.timeline({ repeat: -1, repeatDelay: 3.2, delay: 0.9 });
          STATUS_LINES.forEach((line) => {
            loop
              .to(statusEl, {
                scrambleText: { text: line, chars: "lowerCase", speed: 0.5 },
                duration: 1.2,
                ease: "none",
              })
              .to({}, { duration: 3 });
          });
        }

        /* endless idle: chars bob, ring spins, pulses expand, elements drift */
        split?.chars.forEach((char, index) => {
          gsap.to(char, {
            y: index % 2 ? -10 : 8,
            duration: 2.6 + index * 0.4,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
            delay: 1.4,
          });
        });
        gsap.to(".nf-ring", { rotation: 360, duration: 46, ease: "none", repeat: -1 });
        gsap.utils.toArray<HTMLElement>(".nf-pulse", root).forEach((pulse, index) => {
          gsap.fromTo(
            pulse,
            { scale: 0.3, autoAlpha: 0.5 },
            {
              scale: 1.65,
              autoAlpha: 0,
              duration: 3.2,
              ease: "power1.out",
              repeat: -1,
              delay: index * 1.6,
            },
          );
        });
        gsap.utils.toArray<HTMLElement>(".nf-el", root).forEach((el, index) => {
          gsap.to(el, {
            yPercent: 24 + ((index * 13) % 30),
            duration: 3.4 + index * 0.6,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
          });
        });

        return () => split?.revert();
      });
    },
    { scope: rootRef },
  );

  return (
    <main ref={rootRef} className="notfound">
      <AmbientBackground />
      <CursorGlow />
      <LiquidBlob className="liquid-404" strength={0.28} goo />
      <span className="nf-pulse" aria-hidden="true" />
      <span className="nf-pulse" aria-hidden="true" />
      <span className="nf-el orbit-ring nf-ring nf-el-a" data-depth="26" aria-hidden="true" />
      <span className="nf-el orbit-orb nf-el-b" data-depth="16" aria-hidden="true" />
      <span className="nf-el orbit-cross nf-el-c" data-depth="30" aria-hidden="true" />
      <span className="nf-el orbit-dot nf-el-d" data-depth="12" aria-hidden="true" />
      <div className="nf-inner" data-depth="7">
        <p className="eyebrow nf-eyebrow">plattnericus.dev</p>
        <h1 className="nf-code" aria-label="404">
          404
        </h1>
        <p className="body nf-line">This page is not deployed.</p>
        <p className="nf-status mono" aria-hidden="true" />
        <div className="nf-actions">
          <MagneticButton href="/" variant="primary" icon={<ArrowLeft aria-hidden="true" />}>
            Back to Nexor
          </MagneticButton>
          <MagneticButton href={siteConfig.github} external icon={<GitBranch aria-hidden="true" />}>
            GitHub
          </MagneticButton>
        </div>
      </div>
    </main>
  );
}
