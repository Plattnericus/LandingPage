"use client";

import { useRef } from "react";
import { GitBranch, Globe, Mail } from "lucide-react";
import AnimatedHeadline from "@/components/motion/AnimatedHeadline";
import LiquidBlob from "@/components/motion/LiquidBlob";
import MagneticButton from "@/components/motion/MagneticButton";
import GithubStatsStrip from "@/components/ui/GithubStatsStrip";
import { EASE, NO_MOTION_PREF, ScrollTrigger, gsap, useGSAP } from "@/lib/animation";
import type { GithubSummary } from "@/lib/github";
import { siteConfig } from "@/lib/site";

export default function ContactSection({ github }: { github: GithubSummary }) {
  const sectionRef = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;
      const mm = gsap.matchMedia();

      mm.add(NO_MOTION_PREF, () => {
        /* endless display marquee; slows down under the pointer */
        const marquee = gsap.to(".marquee-track", {
          xPercent: -50,
          duration: 26,
          ease: "none",
          repeat: -1,
          paused: true,
        });
        ScrollTrigger.create({
          trigger: ".contact-marquee",
          start: "top bottom",
          end: "bottom top",
          onToggle: (self) => (self.isActive ? marquee.play() : marquee.pause()),
        });
        const marqueeEl = section.querySelector<HTMLElement>(".contact-marquee");
        const slow = () => gsap.to(marquee, { timeScale: 0.18, duration: 0.5, overwrite: "auto" });
        const fast = () => gsap.to(marquee, { timeScale: 1, duration: 0.7, overwrite: "auto" });
        marqueeEl?.addEventListener("pointerenter", slow);
        marqueeEl?.addEventListener("pointerleave", fast);

        gsap.from(".contact-lead, .contact-actions, .contact-footer", {
          autoAlpha: 0,
          y: 30,
          stagger: 0.14,
          duration: 1.0,
          ease: EASE.soft,
          scrollTrigger: { trigger: section, start: "top 62%" },
        });

        /* primary CTA breathes softly while the section is visible */
        const pulse = gsap.to(".contact-primary", {
          boxShadow: "0 0 52px rgba(221, 184, 146, 0.4)",
          duration: 2.2,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          paused: true,
        });
        ScrollTrigger.create({
          trigger: section,
          start: "top 80%",
          onToggle: (self) => (self.isActive ? pulse.play() : pulse.pause()),
        });

        return () => {
          marqueeEl?.removeEventListener("pointerenter", slow);
          marqueeEl?.removeEventListener("pointerleave", fast);
        };
      });
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} className="contact section" id="contact" aria-labelledby="contact-title">
      <LiquidBlob className="liquid-contact" strength={0.18} />
      <div className="contact-marquee" aria-hidden="true">
        <div className="marquee-track">
          {[0, 1].map((half) => (
            <span key={half} className="marquee-chunk">
              {[0, 1, 2].map((i) => (
                <span key={i}>
                  Build. Deploy. <em>Secure.</em>
                  {" Repeat. — "}
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>
      <div className="section-inner narrow contact-inner">
        <p className="eyebrow">Contact</p>
        <AnimatedHeadline as="h2" id="contact-title" className="section-title contact-title">
          Want to see what I build next?
        </AnimatedHeadline>
        <p className="body contact-lead">
          You can find my projects on GitHub or contact me directly for websites, tools, hosting
          setups or collaboration.
        </p>
        <GithubStatsStrip github={github} />
        <div className="contact-actions">
          <MagneticButton
            href={siteConfig.github}
            external
            variant="primary"
            className="contact-primary"
            icon={<GitBranch aria-hidden="true" />}
          >
            GitHub
          </MagneticButton>
          <MagneticButton href="https://plattnericus.dev" external icon={<Globe aria-hidden="true" />}>
            plattnericus.dev
          </MagneticButton>
          <MagneticButton href={`mailto:${siteConfig.email}`} icon={<Mail aria-hidden="true" />}>
            Email
          </MagneticButton>
        </div>
        <p className="contact-footer mono">plattnericus.dev · Next.js · GSAP · Lenis</p>
      </div>
    </section>
  );
}
