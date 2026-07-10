"use client";

import { useRef } from "react";
import { Code2, Database, Globe, Hammer, Workflow } from "lucide-react";
import AnimatedHeadline from "@/components/motion/AnimatedHeadline";
import { EASE, MM_DESKTOP, MM_MOBILE, PIN, gsap, useGSAP } from "@/lib/animation";
import { techGroups } from "@/lib/content";

const GROUP_ICONS = [Code2, Globe, Database, Workflow, Hammer];

export default function TechStackSection() {
  const sectionRef = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;
      const mm = gsap.matchMedia();

      mm.add({ desktop: MM_DESKTOP, mobile: MM_MOBILE }, (ctx) => {
        const isDesktop = Boolean(ctx.conditions?.desktop);
        const rows = gsap.utils.toArray<HTMLElement>(".tech-row", section);

        if (!isDesktop) {
          rows.forEach((row) => {
            gsap.from(row, {
              autoAlpha: 0,
              y: 48,
              duration: 0.9,
              ease: EASE.soft,
              scrollTrigger: { trigger: row, start: "top 82%" },
            });
            gsap.from(row.querySelectorAll(".tag"), {
              autoAlpha: 0,
              y: 14,
              stagger: 0.045,
              duration: 0.5,
              ease: EASE.soft,
              scrollTrigger: { trigger: row, start: "top 78%" },
            });
          });
          return;
        }

        /* pinned cascade: every group slides in, holds focus, then hands
           it to the next one — no more racing through the stack */
        gsap.set(rows, { autoAlpha: 0, y: 54 });

        const tl = gsap.timeline({
          defaults: { ease: "power3.out" },
          scrollTrigger: {
            id: "tech",
            trigger: section,
            start: "top top",
            end: `+=${PIN.tech}`,
            scrub: 1,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        rows.forEach((row, index) => {
          const at = 0.4 + index * 2.0;
          tl.to(row, { autoAlpha: 1, y: 0, duration: 0.7 }, at)
            .fromTo(
              row.querySelector(".tech-label svg"),
              { rotation: -90, scale: 0.4, autoAlpha: 0 },
              { rotation: 0, scale: 1, autoAlpha: 1, duration: 0.5, ease: "back.out(2)", immediateRender: false },
              at + 0.1,
            )
            .fromTo(
              row.querySelectorAll(".tag"),
              { autoAlpha: 0, y: 16, scale: 0.9 },
              { autoAlpha: 1, y: 0, scale: 1, stagger: 0.06, duration: 0.4, ease: "back.out(1.6)", immediateRender: false },
              at + 0.2,
            );
          if (index > 0) {
            tl.to(rows[index - 1], { autoAlpha: 0.55, duration: 0.6, ease: "power1.inOut" }, at);
          }
        });
        /* settle: the whole stack lights back up before the pin releases */
        tl.to(rows, { autoAlpha: 1, duration: 0.9, ease: "power1.inOut" }, "+=0.5").to({}, { duration: 0.8 });

        /* hover wave stays interactive while pinned */
        const cleanups: Array<() => void> = [];
        rows.forEach((row) => {
          const onEnter = () => {
            gsap.fromTo(
              row.querySelectorAll(".tag"),
              { y: 0 },
              {
                y: -8,
                duration: 0.2,
                stagger: 0.028,
                yoyo: true,
                repeat: 1,
                ease: "power2.out",
                overwrite: "auto",
              },
            );
          };
          row.addEventListener("pointerenter", onEnter);
          cleanups.push(() => row.removeEventListener("pointerenter", onEnter));
        });
        return () => cleanups.forEach((cleanup) => cleanup());
      });
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} className="tech section" id="stack" aria-labelledby="tech-title">
      <div className="section-inner">
        <p className="eyebrow">Tech Stack</p>
        <AnimatedHeadline as="h2" id="tech-title" className="section-title tech-title">
          Tools I use to build.
        </AnimatedHeadline>
        <div className="tech-rows">
          {techGroups.map((group, index) => {
            const Icon = GROUP_ICONS[index];
            return (
              <div key={group.label} className="tech-row">
                <h3 className="tech-label">
                  <Icon aria-hidden="true" />
                  {group.label}
                </h3>
                <ul className="tech-items" aria-label={group.label}>
                  {group.items.map((item) => (
                    <li key={item} className="tag">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
