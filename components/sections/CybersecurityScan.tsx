"use client";

import { useRef } from "react";
import AnimatedHeadline from "@/components/motion/AnimatedHeadline";
import RadarScan from "@/components/mockups/RadarScan";
import { EASE, NO_MOTION_PREF, ScrollTrigger, gsap, useGSAP } from "@/lib/animation";
import { securityTopics } from "@/lib/content";

export default function CybersecurityScan() {
  const sectionRef = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;
      const mm = gsap.matchMedia();

      mm.add(NO_MOTION_PREF, () => {
        gsap.from(".security-lead, .security-future", {
          autoAlpha: 0,
          y: 26,
          stagger: 0.15,
          duration: 0.9,
          ease: EASE.soft,
          scrollTrigger: { trigger: section, start: "top 60%" },
        });

        /* radar rings draw + blips pop, scrubbed */
        gsap.fromTo(
          ".radar-ring",
          { drawSVG: "0%" },
          {
            drawSVG: "100%",
            stagger: 0.14,
            ease: "none",
            immediateRender: false,
            scrollTrigger: { trigger: ".radar", start: "top 82%", end: "top 40%", scrub: 1 },
          },
        );
        gsap.fromTo(
          ".radar-blip",
          { scale: 0, autoAlpha: 0, transformOrigin: "50% 50%" },
          {
            scale: 1,
            autoAlpha: 1,
            stagger: 0.3,
            ease: "back.out(2.5)",
            immediateRender: false,
            scrollTrigger: { trigger: ".radar", start: "top 55%", end: "top 20%", scrub: 1 },
          },
        );

        /* sweep spins only while visible */
        const sweep = gsap.to(".radar-sweep", {
          rotation: 360,
          duration: 5.5,
          ease: "none",
          repeat: -1,
          paused: true,
        });
        ScrollTrigger.create({
          trigger: section,
          start: "top 85%",
          end: "bottom 10%",
          onToggle: (self) => (self.isActive ? sweep.play() : sweep.pause()),
        });

        /* status line scrambles in once */
        gsap.to(".radar-status", {
          scrambleText: { text: "scan · 0 critical · hardening in progress", chars: "lowerCase", speed: 0.5 },
          duration: 1.4,
          ease: "none",
          scrollTrigger: { trigger: ".radar", start: "top 55%" },
        });

        /* checklist ticks one by one over a long scroll span — each topic
           gets its own beat instead of the list flashing through */
        gsap.utils.toArray<HTMLElement>(".sec-topic", section).forEach((topic, index) => {
          const check = topic.querySelector(".check-path");
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: ".security-list",
              start: `top+=${index * 52} 78%`,
              end: `top+=${index * 52 + 130} 42%`,
              scrub: 1,
            },
          });
          tl.fromTo(
            topic,
            { x: -18, autoAlpha: 0.3, scale: 0.985 },
            { x: 0, autoAlpha: 1, scale: 1, duration: 0.4, immediateRender: false },
          ).to(topic, { color: "var(--text)", duration: 0.3 }, 0.1);
          if (check) {
            tl.fromTo(
              check,
              { drawSVG: "0%" },
              { drawSVG: "100%", duration: 0.4, ease: "power2.out", immediateRender: false },
              0.1,
            );
          }
        });
      });
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} className="security section" id="security" aria-labelledby="security-title">
      <div className="section-inner security-inner">
        <div className="security-copy">
          <p className="eyebrow">Cybersecurity Future</p>
          <AnimatedHeadline as="h2" id="security-title" className="section-title security-title" mode="scrub-blur">
            Learning how systems break, so I can build them safer.
          </AnimatedHeadline>
          <p className="body security-lead">
            Cybersecurity is one of the areas I want to grow into. I am currently learning web
            security, Linux hardening, networking fundamentals and secure deployment practices.
          </p>
          <p className="body security-future">
            In the future, I want to work as a DevOps and Cybersecurity-focused engineer, combining
            infrastructure, automation, secure deployments and real-world security knowledge.
          </p>
        </div>
        <div className="security-panel">
          <RadarScan />
          <ul className="security-list" aria-label="Security topics">
            {securityTopics.map((topic) => (
              <li key={topic} className="sec-topic">
                <svg viewBox="0 0 20 20" className="sec-check" aria-hidden="true">
                  <rect x="1.5" y="1.5" width="17" height="17" rx="5" className="check-box" />
                  <path d="M5.5 10.5 L9 14 L14.5 6.5" className="check-path" />
                </svg>
                {topic}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
