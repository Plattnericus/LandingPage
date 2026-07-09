"use client";

import { useRef } from "react";
import AnimatedHeadline from "@/components/motion/AnimatedHeadline";
import ProjectSlide from "@/components/sections/ProjectSlide";
import {
  EASE,
  MM_DESKTOP,
  MM_MOBILE,
  ScrollTrigger,
  SplitText,
  gsap,
  useGSAP,
} from "@/lib/animation";
import { findRepoStats, type GithubSummary } from "@/lib/github";
import { projects } from "@/lib/projects";

export default function ProjectShowcase({ github }: { github: GithubSummary }) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const viewport = viewportRef.current;
      const track = trackRef.current;
      if (!section || !viewport || !track) return;
      const mm = gsap.matchMedia();

      mm.add({ desktop: MM_DESKTOP, mobile: MM_MOBILE }, (ctx) => {
        const isDesktop = Boolean(ctx.conditions?.desktop);
        const slides = gsap.utils.toArray<HTMLElement>(".project-slide", track);
        const splits: SplitText[] = [];

        if (isDesktop) {
          const distance = () => track.scrollWidth - viewport.clientWidth;
          const tween = gsap.to(track, {
            x: () => -distance(),
            ease: "none",
            scrollTrigger: {
              id: "projects",
              trigger: section,
              start: "top top",
              end: () => `+=${distance()}`,
              scrub: 1,
              pin: true,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });

          gsap.set(slides.slice(1), { scale: 0.94, autoAlpha: 0.45 });

          slides.forEach((slide, index) => {
            const inView =
              index === 0
                ? { trigger: section, start: "top 60%" }
                : { trigger: slide, containerAnimation: tween, start: "left 78%" };

            ScrollTrigger.create({
              trigger: slide,
              containerAnimation: tween,
              start: "left 62%",
              end: "right 38%",
              onToggle: (self) => {
                slide.classList.toggle("is-active", self.isActive);
                gsap.to(slide, {
                  scale: self.isActive ? 1 : 0.94,
                  autoAlpha: self.isActive ? 1 : 0.45,
                  duration: 0.55,
                  ease: "power3.out",
                  overwrite: "auto",
                });
              },
            });

            const name = slide.querySelector<HTMLElement>(".slide-name");
            if (name) {
              const split = SplitText.create(name, { type: "chars" });
              splits.push(split);
              gsap.from(split.chars, {
                yPercent: 96,
                autoAlpha: 0,
                stagger: 0.035,
                duration: 0.85,
                ease: EASE.out,
                scrollTrigger: inView,
              });
            }

            gsap.from(
              slide.querySelectorAll(".slide-tags .tag, .slide-stats, .slide-actions .btn"),
              {
                autoAlpha: 0,
                y: 18,
                stagger: 0.06,
                duration: 0.6,
                ease: EASE.soft,
                scrollTrigger:
                  index === 0
                    ? { trigger: section, start: "top 55%" }
                    : { trigger: slide, containerAnimation: tween, start: "left 72%" },
              },
            );

            const inner = slide.querySelector<HTMLElement>("[data-parallax]");
            if (inner) {
              gsap.fromTo(
                inner,
                { xPercent: 7 },
                {
                  xPercent: -7,
                  ease: "none",
                  scrollTrigger: {
                    trigger: slide,
                    containerAnimation: tween,
                    start: "left right",
                    end: "right left",
                    scrub: true,
                  },
                },
              );
            }

            const arc = slide.querySelector<SVGPathElement>(".arc-path");
            if (arc) {
              gsap.from(arc, {
                drawSVG: "0%",
                duration: 1.4,
                ease: EASE.inOut,
                scrollTrigger:
                  index === 0
                    ? { trigger: section, start: "top 50%" }
                    : { trigger: slide, containerAnimation: tween, start: "left 66%" },
              });
            }
          });
        } else {
          slides.forEach((slide) => {
            gsap.from(slide, {
              autoAlpha: 0,
              y: 48,
              duration: 0.9,
              ease: EASE.soft,
              scrollTrigger: { trigger: slide, start: "top 78%" },
            });

            const arc = slide.querySelector<SVGPathElement>(".arc-path");
            if (arc) {
              gsap.from(arc, {
                drawSVG: "0%",
                duration: 1.2,
                ease: EASE.inOut,
                scrollTrigger: { trigger: slide, start: "top 62%" },
              });
            }
          });
        }

        return () => splits.forEach((split) => split.revert());
      });
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} className="projects section" id="projects" aria-labelledby="projects-title">
      <div className="section-inner projects-head">
        <p className="eyebrow">Selected work</p>
        <AnimatedHeadline as="h2" id="projects-title" className="section-title">
          Projects with real purpose.
        </AnimatedHeadline>
      </div>
      <div ref={viewportRef} className="projects-viewport">
        <div ref={trackRef} className="project-track">
          {projects.map((project, index) => (
            <ProjectSlide
              key={project.slug}
              project={project}
              index={index}
              stats={findRepoStats(github, project.repoName)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
