"use client";

import { useRef } from "react";
import { ScrollTrigger, gsap, useGSAP } from "@/lib/animation";

const ZOOM_END = 0.4; // lead-in "web experiences" composition zoom completes
const APPEAR_END = 0.26; // ENTER NEXOR has emerged to its readable size
const DWELL_END = 0.33; // ...holds a short readable beat, then the dive begins
                        // (overlapping the tail of the lead-in fade, so the
                        // wordmark never sits dead-still for long)
const DIVE_END = 0.95; // the dive into the T has fully flooded the frame cream
const FLOOD_SCALE = 24; // scale at which the cream T covers the whole viewport

/**
 * Faithful Lenis solution takeover: a long scroll section with one sticky
 * viewport. The lead-in composition zooms up and fades, then ENTER NEXOR
 * emerges, dwells a beat, and dives straight INTO the T — because that glyph
 * is a solid cream shape, scaling into its centre floods the frame cream and
 * hands off to the light section, so the T itself is the transition (no iris
 * circle). Scroll progress stays raw and deterministic; Lenis supplies only
 * the input smoothing.
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

        /* Lead-in: "So we built / web experiences" + "As it should be" zoom up
           as a unit and fade, exactly as before. */
        const zoomProgress = clamp(progress / ZOOM_END);
        section.style.setProperty("--rethink-progress-1", String(zoomProgress));

        /* ENTER NEXOR emerges (ease-out settle to its readable size), dwells a
           beat, then dives INTO the T. The dive is exponential so it accelerates
           like a camera flying into the glyph; at FLOOD_SCALE the solid cream T
           covers the whole viewport — that flood is the entire transition. */
        let enterScale: number;
        if (progress <= APPEAR_END) {
          const t = progress / APPEAR_END;
          enterScale = 1 - Math.pow(1 - t, 3);
        } else if (progress <= DWELL_END) {
          enterScale = 1;
        } else if (progress <= DIVE_END) {
          const t = (progress - DWELL_END) / (DIVE_END - DWELL_END);
          enterScale = Math.pow(FLOOD_SCALE, t);
        } else {
          enterScale = FLOOD_SCALE;
        }
        section.style.setProperty("--rt-enter-scale", String(enterScale));
        section.style.setProperty(
          "--rt-enter-opacity",
          String(clamp((progress / APPEAR_END) * 2.5)),
        );

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

        /* Once the cream T has fully flooded the frame, paint the section (and
           page) cream so the final stretch hands seamlessly to the light
           section below — the flip is invisible because the frame is already
           solid cream at that point. */
        if (progress >= DIVE_END) {
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
        section.style.removeProperty("--rt-enter-scale");
        section.style.removeProperty("--rt-enter-opacity");
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
