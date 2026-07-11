"use client";

import { useRef } from "react";
import { Heart } from "lucide-react";
import { EASE, gsap, useGSAP } from "@/lib/animation";
import { siteConfig } from "@/lib/site";

export default function Footer() {
  const sectionRef = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        ".fx-type, .fx-cta-row",
        { y: 60, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 1,
          stagger: 0.14,
          ease: EASE.appleOut,
          scrollTrigger: { trigger: sectionRef.current, start: "top 62%" },
        },
      );
    },
    { scope: sectionRef },
  );

  return (
    <footer ref={sectionRef} className="footer-giant" id="contact" aria-label="Contact">
      <div>
        <p className="fx-type fx-l1">
          Nexor is <span className="fx-accent">open source</span>
        </p>
        <p className="fx-type fx-l2">
          open to projects
          <br />
          and ideas
        </p>
      </div>

      <div className="fx-cta-row">
        <a className="pill" href={`mailto:${siteConfig.email}`}>
          <span className="pill-icon">
            <Heart aria-hidden="true" />
          </span>
          <span className="pill-label">Get in touch</span>
        </a>

        <nav className="fx-links" aria-label="Profiles">
          <a href={siteConfig.github} target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a
            href="https://modrinth.com/mod/projectile.preview"
            target="_blank"
            rel="noreferrer"
          >
            Modrinth
          </a>
          <a href={`mailto:${siteConfig.email}`}>Mail</a>
          <a href={siteConfig.url}>plattnericus.dev</a>
        </nav>
      </div>
    </footer>
  );
}
