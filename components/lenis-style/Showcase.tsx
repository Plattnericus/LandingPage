"use client";

import { useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import {
  EASE,
  MM_DESKTOP,
  MM_MOBILE,
  NO_MOTION_PREF,
  PIN,
  gsap,
  useGSAP,
} from "@/lib/animation";
import { projects } from "@/lib/projects";
import { siteConfig } from "@/lib/site";
import ProjectPreview from "./ProjectPreview";

export default function Showcase() {
  const sectionRef = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const track = section?.querySelector<HTMLElement>(".showcase-track");
      if (!section || !track) return;

      const distance = () => Math.max(0, track.scrollWidth - window.innerWidth * 0.62);
      const media = gsap.matchMedia();

      media.add(MM_DESKTOP, () => {
        gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            id: "showcase",
            trigger: section,
            start: "top top",
            end: () => `+=${PIN.showcase + distance() * 0.4}`,
            scrub: 1,
            pin: ".showcase-pin",
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });
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
            Nexor
            <br />
            runs live
          </h2>
          <p className="showcase-copy">
            Not mockups — deployments. A school platform students open every morning, a 3D
            portfolio, a browser desktop, a Minecraft mod on Modrinth. Everything below is
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
