"use client";

import { useRef } from "react";
import { ScrollTrigger, gsap, useGSAP } from "@/lib/animation";

const ZOOM_PROGRESS_END = 0.6;
const WIPE_PROGRESS_START = 0.545;

/**
 * Faithful Lenis solution takeover: a long scroll section with one sticky
 * viewport. The complete type composition zooms as a unit, the centered
 * ENTER NEXOR layer grows through it, and a light horizontal wipe closes the
 * scene. Scroll progress stays raw and deterministic; Lenis supplies only the
 * input smoothing.
 */
export default function Rethink() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const enterRef = useRef<HTMLHeadingElement | null>(null);
  const tRef = useRef<HTMLSpanElement | null>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      const clamp = gsap.utils.clamp(0, 1);
      const rtFirst = section.querySelector<HTMLElement>(".rt-first");
      const enterEl = enterRef.current;
      const tEl = tRef.current;

      /* Zoom focal point is the T in "ENTER" — offsetLeft/Top/Width/Height
         are layout metrics (transform-immune), so this reads the T's real
         position even while rt-enter itself sits at scale(0). Re-measured on
         every ScrollTrigger refresh, since font-size is viewport-relative. */
      const measureOrigin = () => {
        if (!enterEl || !tEl || enterEl.offsetWidth === 0) return;
        const xPercent =
          ((tEl.offsetLeft + tEl.offsetWidth / 2) / enterEl.offsetWidth) * 100;
        const yPercent =
          ((tEl.offsetTop + tEl.offsetHeight / 2) / enterEl.offsetHeight) * 100;
        enterEl.style.setProperty("--rethink-origin-x", `${xPercent}%`);
        enterEl.style.setProperty("--rethink-origin-y", `${yPercent}%`);
      };

      const updateProgress = () => {
        const viewportHeight = window.innerHeight;
        const scroll = window.scrollY;
        const bounds = section.getBoundingClientRect();
        const sectionTop = bounds.top + scroll;

        /* Exact lenis.dev map: begin half a viewport into the section and
           finish when the section bottom is one viewport away. */
        const start = sectionTop + viewportHeight * 0.5;
        const end = sectionTop + bounds.height - viewportHeight;
        const progress = clamp((scroll - start) / Math.max(1, end - start));
        const zoomProgress = clamp(progress / ZOOM_PROGRESS_END);
        const wipeProgress = clamp(
          (progress - WIPE_PROGRESS_START) / (1 - WIPE_PROGRESS_START),
        );

        section.style.setProperty("--rethink-progress-1", String(zoomProgress));
        section.style.setProperty("--rethink-progress-2", String(wipeProgress));

        /* rt-first/rt-second exit through rethink-inner's clipped edges as
           this translates/scales, and used to hit that overflow:hidden clip
           as a hard, fully-opaque mid-glyph cutoff — the block's own resting
           padding to the edge is a small fraction of its height, so clipping
           starts almost as soon as it moves. offsetTop/offsetHeight are
           layout metrics (transform doesn't affect them), so this reads the
           untransformed gap to the clip edge correctly no matter the current
           scroll position or viewport size, and stays right across resizes.
           Fading fully out before that point removes the clip edge entirely. */
        if (rtFirst && rtFirst.offsetHeight > 0) {
          const clipOnset = rtFirst.offsetTop / rtFirst.offsetHeight;
          const fadeStart = clipOnset * 0.5;
          const fadeSpan = Math.max(0.001, clipOnset - fadeStart);
          const textFade = 1 - clamp((zoomProgress - fadeStart) / fadeSpan);
          section.style.setProperty("--rethink-text-fade", String(textFade));
        }

        if (progress === 1) {
          section.style.backgroundColor = "currentColor";
          document.body.style.setProperty("--page-bg", "#f2ede6");
        } else {
          section.style.removeProperty("background-color");
          document.body.style.setProperty("--page-bg", "#0b0908");
        }
      };

      const trigger = ScrollTrigger.create({
        id: "rethink",
        trigger: section,
        start: "top bottom",
        end: "bottom top",
        invalidateOnRefresh: true,
        onUpdate: updateProgress,
        onRefresh: () => {
          measureOrigin();
          updateProgress();
        },
      });

      measureOrigin();
      updateProgress();

      return () => {
        trigger.kill();
        section.style.removeProperty("--rethink-progress-1");
        section.style.removeProperty("--rethink-progress-2");
        section.style.removeProperty("--rethink-text-fade");
        section.style.removeProperty("background-color");
        document.body.style.removeProperty("--page-bg");
        enterEl?.style.removeProperty("--rethink-origin-x");
        enterEl?.style.removeProperty("--rethink-origin-y");
      };
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} className="rethink" aria-label="Enter Nexor">
      <div className="rethink-inner">
        <div className="rethink-zoom">
          <h2 className="rt-first">
            So we built
            <br />
            <span>web experiences</span>
          </h2>
          <h2 className="rt-second">As it should be</h2>
        </div>
        <h2 className="rt-enter" ref={enterRef}>
          En
          <span ref={tRef}>t</span>
          er
          <br />
          Nexor
        </h2>
      </div>
    </section>
  );
}
