"use client";

import { useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import {
  EASE,
  MM_DESKTOP,
  MM_MOBILE,
  NO_MOTION_PREF,
  PIN,
  ScrollTrigger,
  gsap,
  useGSAP,
} from "@/lib/animation";
import { useSmoothScroll } from "@/components/providers/SmoothScrollProvider";
import { projects } from "@/lib/projects";
import { siteConfig } from "@/lib/site";
import ProjectPreview from "./ProjectPreview";

export default function Showcase() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const { lenisRef } = useSmoothScroll();

  useGSAP(
    () => {
      const section = sectionRef.current;
      const track = section?.querySelector<HTMLElement>(".showcase-track");
      if (!section || !track) return;

      const distance = () => Math.max(0, track.scrollWidth - window.innerWidth * 0.62);
      const media = gsap.matchMedia();

      media.add(MM_DESKTOP, () => {
        /* The pin is CSS sticky (see .showcase-pin), the same technique the
           Rethink and Heat sections use — not a GSAP pin. A GSAP pin flips the
           element to position: fixed and back, which the browser records as
           layout shifts (CLS ≈ 3.8 on every desktop scroll-through) and which
           made ScrollTrigger reset the page to the top when the viewport
           crossed the mobile breakpoint. Sticky needs the section to be as
           tall as the scroll the horizontal travel consumes, so it is sized
           here before every refresh measures it. */
        const sizeSection = () => {
          section.style.height = `${window.innerHeight + PIN.showcase + distance() * 0.4}px`;
        };
        sizeSection();
        ScrollTrigger.addEventListener("refreshInit", sizeSection);

        const tween = gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            id: "showcase",
            trigger: section,
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });

        /* Keyboard focus on a card that sits off to the side: the pin clips
           with overflow: clip, so the browser can no longer scroll it sideways
           (that used to shove the whole row — heading included — out of view
           for good). Instead the page scrolls to the point in the pin where
           that card is centred on screen. */
        const onFocusIn = (event: FocusEvent) => {
          const st = tween.scrollTrigger;
          const item = (event.target as Element | null)?.closest<HTMLElement>(
            ".showcase-card, .showcase-endcap",
          );
          const total = distance();
          if (!st || !item || total <= 0) return;
          const rect = item.getBoundingClientRect();
          const baseLeft = rect.left - Number(gsap.getProperty(track, "x"));
          const targetX = gsap.utils.clamp(
            -total,
            0,
            window.innerWidth / 2 - rect.width / 2 - baseLeft,
          );
          const y = st.start + (-targetX / total) * (st.end - st.start);
          const lenis = lenisRef.current;
          if (lenis) lenis.scrollTo(y, { duration: 0.9 });
          else window.scrollTo({ top: y, behavior: "smooth" });
        };
        section.addEventListener("focusin", onFocusIn);

        return () => {
          ScrollTrigger.removeEventListener("refreshInit", sizeSection);
          section.removeEventListener("focusin", onFocusIn);
          section.style.removeProperty("height");
        };
      });

      media.add(MM_MOBILE, () => {
        const items = gsap.utils.toArray<HTMLElement>(
          ".showcase-card, .showcase-endcap",
          section,
        );

        items.forEach((item) => {
          gsap.fromTo(
            item,
            { y: 48, scale: 0.97, autoAlpha: 0 },
            {
              y: 0,
              scale: 1,
              autoAlpha: 1,
              duration: 0.72,
              ease: EASE.soft,
              scrollTrigger: {
                trigger: item,
                start: "top 88%",
                once: true,
              },
            },
          );
        });
      });

      media.add(NO_MOTION_PREF, () => {
        gsap.fromTo(
          ".showcase-head > *",
          { y: 44, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.9,
            stagger: 0.12,
            ease: EASE.soft,
            scrollTrigger: { trigger: section, start: "top 72%" },
          },
        );
      });

      return () => media.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} className="showcase" id="work" aria-labelledby="showcase-title">
      <div className="showcase-pin">
        <div className="showcase-head">
          <h2 className="showcase-title" id="showcase-title">
            Nexor{" "}
            <br />
            runs live
          </h2>
          <p className="showcase-copy">
            Not mockups — deployments. A school platform students open every morning, a 3D
            portfolio, a browser desktop, a Minecraft mod on Modrinth. Everything here is
            real, and most of it is one click away.
          </p>
        </div>

        <div className="showcase-track">
          {projects.map((project) => {
            const href = project.liveUrl ?? project.githubUrl ?? siteConfig.github;
            return (
              <div key={project.slug} className="showcase-card">
                <ProjectPreview
                  preview={project.preview}
                  name={project.name}
                  eyebrow={project.eyebrow}
                />
                <span className="sc-meta">
                  <span className="sc-name">{project.name}</span>
                  <span className="sc-kind">
                    {project.eyebrow} · {project.tech.slice(0, 3).join(" · ")}
                  </span>
                </span>
                <a
                  className="sc-link"
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${project.name} — open ${project.liveUrl ? "live site" : "on GitHub"}`}
                />
              </div>
            );
          })}

          <div className="showcase-endcap">
            <p>Want to see more?</p>
            <a className="pill" href={siteConfig.github} target="_blank" rel="noreferrer">
              <span className="pill-icon">
                <ArrowUpRight aria-hidden="true" />
              </span>
              <span className="pill-label">GitHub profile</span>
            </a>
            <p className="endcap-small">
              Need something built?{" "}
              <a href={`mailto:${siteConfig.email}`}>Get in touch</a>.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
