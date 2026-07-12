"use client";

import { useRef } from "react";
import { ScrollTrigger, gsap, useGSAP } from "@/lib/animation";

const ZOOM_END = 0.8; // lead-in remains visible deep into ENTER NEXOR, like Lenis
const ENTER_START = 0.08; // visible seed size the ENTER NEXOR zoom grows from
                          // (opacity fades it in as it enlarges past the lead-in)
const FLOOD_SCALE = 20; // scale at which the cream T covers the whole viewport
const BG_FLIP_AT = 0.99; // frame is solid cream by here — paint the bg to match

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
      const enterEl = enterRef.current;
      const tEl = tRef.current;

      /* Zoom focal point is the T in "ENTER" — offsetLeft/Top/Width/Height
         are layout metrics (transform-immune), so this reads the T's real
         position even while rt-enter itself sits at scale(0). Re-measured on
         every ScrollTrigger refresh, since font-size is viewport-relative. */
      /* T-centre, kept as strings so updateProgress can build the transform
         directly (see there) as well as feed transform-origin. */
      let originX = "50%";
      let originY = "45%";
      /* Latched cream-flood state, with hysteresis, so it can't strobe. */
      let bgCream = false;
      const measureOrigin = () => {
        if (!enterEl || !tEl || enterEl.offsetWidth === 0) return;
        const xPercent =
          ((tEl.offsetLeft + tEl.offsetWidth / 2) / enterEl.offsetWidth) * 100;
        const yPercent =
          ((tEl.offsetTop + tEl.offsetHeight / 2) / enterEl.offsetHeight) * 100;
        originX = `${xPercent}%`;
        originY = `${yPercent}%`;
        enterEl.style.setProperty("--rethink-origin-x", originX);
        enterEl.style.setProperty("--rethink-origin-y", originY);
      };

      const updateProgress = () => {
        const viewportHeight = window.innerHeight;
        const scroll = window.scrollY;
        const bounds = section.getBoundingClientRect();
        const sectionTop = bounds.top + scroll;

        /* Start almost as soon as the sticky composition arrives. Lenis lets
           ENTER grow underneath the preceding words instead of waiting for
           that composition to leave first. The terminal T flood stays pinned
           to the same section end. */
        const start = sectionTop + viewportHeight * 0.05;
        const end = sectionTop + bounds.height - viewportHeight;
        const progress = clamp((scroll - start) / Math.max(1, end - start));

        /* Lead-in: "So we built / web experiences" + "As it should be" zoom up
           as a unit and fade, exactly as before. */
        const zoomProgress = clamp(progress / ZOOM_END);
        section.style.setProperty("--rethink-progress-1", String(zoomProgress));

        /* ENTER NEXOR is ONE single, continuous exponential zoom straight
           through the T. An exponential means a constant *perceived* zoom rate
           (each scroll unit multiplies the size by the same factor), so it can
           never plateau or "stick" at any size — it just flies in cleanly in
           one motion. It seeds from an invisible ENTER_START, passes through
           readable (~1) around the middle without ever pausing, and reaches the
           cream flood right at the section end. No emerge/dwell/dive stages to
           create a flat spot to grind against. */
        const enterScale = ENTER_START * Math.pow(FLOOD_SCALE / ENTER_START, progress);
        const enterOpacity = clamp(progress / 0.045);
        /* Write the transform straight onto the element, not only through a CSS
           custom property. A will-change:transform layer driven purely by a
           changing variable can skip a compositor update on a fast scroll-
           direction reversal and leave a stale frame — that is the "only the T
           is left" glitch on scroll-back. An explicit inline transform forces
           the update every tick, so a reversal is always clean. */
        if (enterEl) {
          enterEl.style.transform =
            `translate(calc(-1 * ${originX}), calc(-1 * ${originY})) scale(${enterScale})`;
          enterEl.style.opacity = String(enterOpacity);
        }

        /* Keep the lead-in visible while ENTER grows. Its oversized words are
           intentionally clipped by the sticky viewport before fading near the
           end of their zoom — this is the characteristic Lenis overlap. */
        const textFade = 1 - clamp((zoomProgress - 0.82) / 0.16);
        section.style.setProperty("--rethink-text-fade", String(textFade));

        /* Once the cream T has fully flooded the frame, paint the section (and
           page) cream so the final stretch hands seamlessly to the light
           section below — the flip is invisible because the frame is already
           solid cream at that point. Hysteresis (latch on at BG_FLIP_AT, off
           only well below it) stops the whole-page background from strobing —
           and taking the fixed Clawd sprite's layer with it — if the scroll
           settles right on the boundary. */
        if (progress >= BG_FLIP_AT) bgCream = true;
        else if (progress < BG_FLIP_AT - 0.04) bgCream = false;
        if (bgCream) {
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
        /* Force a clean terminal state at both edges too, so a fast reversal
           that outran the last onUpdate can't strand a half-scaled wordmark. */
        onLeave: updateProgress,
        onLeaveBack: updateProgress,
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
        enterEl?.style.removeProperty("transform");
        enterEl?.style.removeProperty("opacity");
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
