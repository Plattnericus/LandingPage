"use client";

import { useRef } from "react";
import { ArrowUpRight, Star } from "lucide-react";
import AnimatedHeadline from "@/components/motion/AnimatedHeadline";
import MagneticButton from "@/components/motion/MagneticButton";
import ProjectVisual from "@/components/mockups/ProjectVisual";
import ProjectSlide from "@/components/sections/ProjectSlide";
import {
  EASE,
  MM_DESKTOP,
  MM_MOBILE,
  ORBIT,
  SplitText,
  gsap,
  useGSAP,
} from "@/lib/animation";
import { findRepoStats, formatRepoDate, type GithubSummary } from "@/lib/github";
import { projects } from "@/lib/projects";

/* rounded so SSR and client render byte-identical SVG attributes */
const round2 = (value: number) => Number(value.toFixed(2));
const TICKS = Array.from({ length: 36 }, (_, i) => {
  const angle = (i * 10 * Math.PI) / 180;
  const outer = 468;
  const inner = i % 3 === 0 ? 448 : 458;
  return {
    x1: round2(500 + Math.cos(angle) * outer),
    y1: round2(500 + Math.sin(angle) * outer),
    x2: round2(500 + Math.cos(angle) * inner),
    y2: round2(500 + Math.sin(angle) * inner),
  };
});

/** Looping micro-motion inside one project visual; played only while its item is active. */
function createAmbient(item: HTMLElement): gsap.core.Tween[] {
  const q = gsap.utils.selector(item);
  const tweens: gsap.core.Tween[] = [];
  const add = (targets: Element[], vars: gsap.TweenVars) => {
    if (targets.length) tweens.push(gsap.to(targets, { paused: true, ...vars }));
  };

  add(q(".pv-cell.is-accent, .pv-row.is-accent, .tool-tile.is-accent"), {
    opacity: 0.45,
    duration: 1.1,
    ease: "sine.inOut",
    stagger: 0.22,
    yoyo: true,
    repeat: -1,
  });
  q(".pv-window").forEach((win, index) =>
    add([win], {
      y: index % 2 ? -4 : 4,
      duration: 2.3 + index * 0.6,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    }),
  );
  add(q(".pv-dock-dot"), {
    opacity: 0.45,
    duration: 1.3,
    ease: "sine.inOut",
    stagger: 0.18,
    yoyo: true,
    repeat: -1,
  });
  add(q(".pv-pokyh-phone"), {
    y: -5,
    duration: 2.6,
    ease: "sine.inOut",
    yoyo: true,
    repeat: -1,
  });
  add(q(".pv-notch"), {
    opacity: 0.5,
    duration: 1.5,
    ease: "sine.inOut",
    yoyo: true,
    repeat: -1,
  });
  const sheen = q(".pv-mirror-sheen");
  if (sheen.length) {
    tweens.push(
      gsap.fromTo(
        sheen,
        { xPercent: -170 },
        { xPercent: 230, duration: 3.4, ease: "power1.inOut", repeat: -1, repeatDelay: 1.4, paused: true },
      ),
    );
  }
  add(q(".pv-mirror-clock"), {
    opacity: 0.7,
    duration: 1.7,
    ease: "sine.inOut",
    yoyo: true,
    repeat: -1,
  });
  add(q(".pv-tile.is-flag svg"), {
    rotation: -14,
    transformOrigin: "50% 88%",
    duration: 0.9,
    ease: "sine.inOut",
    yoyo: true,
    repeat: -1,
    stagger: 0.35,
  });
  add(q(".pv-tile.is-open"), {
    opacity: 0.55,
    duration: 1.2,
    ease: "sine.inOut",
    stagger: 0.14,
    yoyo: true,
    repeat: -1,
  });
  add(q(".arc-path"), {
    strokeDashoffset: -130,
    duration: 3.2,
    ease: "none",
    repeat: -1,
  });
  add(q(".pv-reticle-pulse"), {
    scale: 1.3,
    transformOrigin: "50% 50%",
    duration: 1.1,
    ease: "sine.inOut",
    yoyo: true,
    repeat: -1,
  });

  return tweens;
}

export default function ProjectShowcase({ github }: { github: GithubSummary }) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const wheelRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const wheel = wheelRef.current;
      if (!section) return;
      const mm = gsap.matchMedia();

      mm.add({ desktop: MM_DESKTOP, mobile: MM_MOBILE }, (ctx) => {
        const isDesktop = Boolean(ctx.conditions?.desktop);

        if (!isDesktop || !wheel) {
          const slides = gsap.utils.toArray<HTMLElement>(".project-slide", section);
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
          return;
        }

        const spokes = gsap.utils.toArray<HTMLElement>(".orbit-item", wheel);
        const inners = gsap.utils.toArray<HTMLElement>(".orbit-item-inner", wheel);
        const panels = gsap.utils.toArray<HTMLElement>(".orbit-panel", section);
        const dots = gsap.utils.toArray<HTMLElement>(".orbit-progress-dot", section);
        const names = panels.map((panel) => panel.querySelector<HTMLElement>(".orbit-name"));
        const splits = names.map((name) =>
          name ? SplitText.create(name, { type: "chars", mask: "chars" }) : null,
        );
        const ambients = inners.map(createAmbient);

        /* resting placement */
        spokes.forEach((spoke, i) => gsap.set(spoke, { rotation: ORBIT.stepDeg * i }));
        inners.forEach((inner, i) =>
          gsap.set(inner, {
            xPercent: -50,
            yPercent: -50,
            rotation: -ORBIT.stepDeg * i,
            scale: i ? 0.7 : 1,
            autoAlpha: i ? 0.3 : 1,
          }),
        );
        panels.forEach((panel, i) => {
          if (i) gsap.set(panel, { autoAlpha: 0, y: 30 });
        });

        /* ambient gating: only the active item animates, only while pinned/visible */
        let current = 0;
        let sectionVisible = false;
        const apexPulse = gsap.to(".orbit-apex", {
          scale: 1.5,
          opacity: 0.45,
          duration: 1.2,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          paused: true,
        });
        const syncAmbient = () => {
          ambients.forEach((tweens, i) =>
            tweens.forEach((tween) =>
              sectionVisible && i === current ? tween.play() : tween.pause(),
            ),
          );
          if (sectionVisible) apexPulse.play();
          else apexPulse.pause();
        };
        const setActive = (index: number) => {
          if (index === current) return;
          current = index;
          panels.forEach((panel, i) => panel.classList.toggle("is-active", i === index));
          dots.forEach((dot, i) => dot.classList.toggle("is-active", i === index));
          syncAmbient();
        };

        /* entry (non-scrubbed) */
        gsap.from(wheel, {
          autoAlpha: 0,
          x: -90,
          duration: 1.1,
          ease: EASE.soft,
          scrollTrigger: { trigger: section, start: "top 72%" },
        });
        gsap.from(".orbit-arc", {
          drawSVG: "0%",
          duration: 1.6,
          stagger: 0.2,
          ease: EASE.inOut,
          scrollTrigger: { trigger: section, start: "top 68%" },
        });
        gsap.from(".orbit-tick", {
          autoAlpha: 0,
          duration: 0.4,
          stagger: 0.015,
          scrollTrigger: { trigger: section, start: "top 66%" },
        });
        if (splits[0]) {
          gsap.from(splits[0].chars, {
            yPercent: 110,
            duration: 0.8,
            stagger: 0.04,
            ease: EASE.out,
            scrollTrigger: { trigger: section, start: "top 58%" },
          });
        }
        gsap.from(
          panels[0].querySelectorAll(
            ".slide-index, .eyebrow, .orbit-desc, .slide-tags .tag, .slide-stats, .slide-actions .btn",
          ),
          {
            autoAlpha: 0,
            y: 18,
            duration: 0.6,
            stagger: 0.05,
            ease: EASE.soft,
            scrollTrigger: { trigger: section, start: "top 54%" },
          },
        );

        /* master pinned timeline: one snap step per project switch */
        const tl = gsap.timeline({
          defaults: { ease: "power2.inOut" },
          scrollTrigger: {
            id: "projects",
            trigger: section,
            start: "top top",
            end: `+=${ORBIT.pin}`,
            scrub: 1,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            snap: {
              snapTo: 1 / ORBIT.steps,
              duration: { min: 0.25, max: 0.6 },
              ease: "power2.inOut",
            },
            onUpdate: (self) =>
              setActive(
                Math.round(gsap.utils.clamp(0, ORBIT.steps, self.progress * ORBIT.steps)),
              ),
            onToggle: (self) => {
              sectionVisible = self.isActive;
              syncAmbient();
            },
          },
        });

        for (let step = 1; step <= ORBIT.steps; step++) {
          const pos = step - 1 + 0.2;
          tl.to(wheel, { rotation: -ORBIT.stepDeg * step, duration: 0.7 }, pos);
          inners.forEach((inner, i) => {
            tl.to(inner, { rotation: ORBIT.stepDeg * (step - i), duration: 0.7 }, pos);
          });
          tl.fromTo(
            inners[step],
            { scale: 0.7, autoAlpha: 0.3 },
            { scale: 1, autoAlpha: 1, duration: 0.7, immediateRender: false },
            pos,
          )
            .fromTo(
              inners[step - 1],
              { scale: 1, autoAlpha: 1 },
              { scale: 0.7, autoAlpha: 0.3, duration: 0.7, immediateRender: false },
              pos,
            )
            .fromTo(
              panels[step - 1],
              { autoAlpha: 1, y: 0, filter: "blur(0px)" },
              {
                autoAlpha: 0,
                y: -28,
                filter: "blur(5px)",
                duration: 0.35,
                ease: "power2.in",
                immediateRender: false,
              },
              pos,
            )
            .fromTo(
              panels[step],
              { autoAlpha: 0, y: 30, filter: "blur(5px)" },
              {
                autoAlpha: 1,
                y: 0,
                filter: "blur(0px)",
                duration: 0.45,
                ease: "power2.out",
                immediateRender: false,
              },
              pos + 0.3,
            );
          const split = splits[step];
          if (split) {
            tl.fromTo(
              split.chars,
              { yPercent: 110 },
              {
                yPercent: 0,
                duration: 0.5,
                stagger: 0.03,
                ease: "power3.out",
                immediateRender: false,
              },
              pos + 0.32,
            );
          }
          tl.fromTo(
            panels[step].querySelectorAll(".slide-tags .tag, .slide-stats, .slide-actions .btn"),
            { autoAlpha: 0, y: 14 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.35,
              stagger: 0.05,
              ease: "back.out(1.5)",
              immediateRender: false,
            },
            pos + 0.42,
          );
        }
        tl.fromTo(
          ".projects-head",
          { y: 0 },
          { y: -36, ease: "none", duration: ORBIT.steps, immediateRender: false },
          0,
        );

        return () => {
          splits.forEach((split) => split?.revert());
        };
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

      <div className="orbit-stage">
        <div ref={wheelRef} className="orbit-wheel">
          <svg className="orbit-ring-svg" viewBox="0 0 1000 1000" fill="none" aria-hidden="true">
            <circle cx="500" cy="500" r="468" className="orbit-arc" />
            <circle cx="500" cy="500" r="345" className="orbit-arc thin" />
            {TICKS.map((tick, i) => (
              <line key={i} className="orbit-tick" {...tick} />
            ))}
          </svg>
          {projects.map((project, index) => (
            <div key={project.slug} className="orbit-item">
              <div className="orbit-item-arm">
                <div className="orbit-item-inner" aria-hidden={index !== 0}>
                  <ProjectVisual id={project.visual} />
                </div>
              </div>
            </div>
          ))}
        </div>
        <span className="orbit-apex" aria-hidden="true" />

        <div className="orbit-copy">
          {projects.map((project, index) => {
            const stats = findRepoStats(github, project.repoName);
            return (
              <article key={project.slug} className={`orbit-panel${index === 0 ? " is-active" : ""}`}>
                <p className="slide-index mono">
                  {String(index + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
                </p>
                <p className="eyebrow">{project.eyebrow}</p>
                <h3 className="orbit-name">{project.name}</h3>
                <p className="body orbit-desc">{project.description}</p>
                <ul className="slide-tags" aria-label="Technologies">
                  {project.tech.map((tech) => (
                    <li key={tech} className="tag">
                      {tech}
                    </li>
                  ))}
                </ul>
                {stats ? (
                  <p className="slide-stats">
                    <Star aria-hidden="true" />
                    {stats.stars} stars
                    <span aria-hidden="true">·</span>
                    Updated {formatRepoDate(stats.pushedAt)}
                  </p>
                ) : null}
                <div className="slide-actions">
                  {project.liveUrl ? (
                    <MagneticButton
                      href={project.liveUrl}
                      external
                      variant="primary"
                      icon={<ArrowUpRight aria-hidden="true" />}
                    >
                      Open Live
                    </MagneticButton>
                  ) : null}
                  {project.githubUrl ? (
                    <MagneticButton
                      href={project.githubUrl}
                      external
                      icon={<ArrowUpRight aria-hidden="true" />}
                    >
                      View on GitHub
                    </MagneticButton>
                  ) : null}
                </div>
              </article>
            );
          })}
          <div className="orbit-progress" aria-hidden="true">
            {projects.map((project, index) => (
              <span
                key={project.slug}
                className={`orbit-progress-dot${index === 0 ? " is-active" : ""}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="projects-stack">
        {projects.map((project, index) => (
          <ProjectSlide
            key={project.slug}
            project={project}
            index={index}
            stats={findRepoStats(github, project.repoName)}
          />
        ))}
      </div>
    </section>
  );
}
