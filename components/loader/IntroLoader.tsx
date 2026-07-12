"use client";

import { useEffect, useRef, useState } from "react";
import NexorWordmark from "@/components/brand/NexorWordmark";
import { useSmoothScroll } from "@/components/providers/SmoothScrollProvider";

const REVEAL_AT_MS = 180;
const EXIT_EARLIEST_MS = 1900;
const MERGE_DELAY_MS = 60;
const EXIT_DURATION_MS = 1400;
const MAX_READY_WAIT_MS = 3400;

/**
 * Lenis-style intro architecture using the site's own NEXOR wordmark:
 * one second of colour, five staggered glyphs in two rows, then a counter-
 * moving stage under an upward curtain. The real Lenis mark is bespoke SVG,
 * so its trademark paths are intentionally not copied here.
 */
export default function IntroLoader() {
  const { completeIntro } = useSmoothScroll();
  const [gone, setGone] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const skipIntro =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      window.matchMedia("(max-width: 799.98px)").matches;

    if (skipIntro) {
      /* lenis.dev also skips the intro below 800px */
      const release = window.setTimeout(() => {
        completeIntro();
        setGone(true);
      }, 0);
      return () => window.clearTimeout(release);
    }

    const root = rootRef.current;
    if (!root) {
      completeIntro();
      setGone(true);
      return;
    }

    const signals = {
      fonts: !document.fonts,
      load: document.readyState === "complete",
      gl: false,
    };
    let earliestReached = false;
    let exiting = false;
    let mergeTimer = 0;
    let finishTimer = 0;

    const startExit = () => {
      if (exiting) return;
      exiting = true;

      root.classList.add("intro-out");
      window.dispatchEvent(new Event("intro-reveal"));

      mergeTimer = window.setTimeout(() => {
        root.classList.add("intro-merge");
      }, MERGE_DELAY_MS);

      finishTimer = window.setTimeout(() => {
        completeIntro();
        setGone(true);
      }, EXIT_DURATION_MS);
    };

    const maybeStartExit = () => {
      if (earliestReached && signals.fonts && signals.load && signals.gl) {
        startExit();
      }
    };

    document.fonts?.ready
      .then(() => {
        signals.fonts = true;
        maybeStartExit();
      })
      .catch(() => {
        signals.fonts = true;
        maybeStartExit();
      });

    const onLoad = () => {
      signals.load = true;
      maybeStartExit();
    };
    if (!signals.load) window.addEventListener("load", onLoad, { once: true });

    const onGlReady = () => {
      signals.gl = true;
      maybeStartExit();
    };
    window.addEventListener("gl-ready", onGlReady, { once: true });

    const revealTimer = window.setTimeout(() => {
      root.classList.add("intro-show");
    }, REVEAL_AT_MS);

    const earliestTimer = window.setTimeout(() => {
      earliestReached = true;
      maybeStartExit();
    }, EXIT_EARLIEST_MS);

    /* Slow or failed WebGL/font loads must never hold the page hostage. */
    const capTimer = window.setTimeout(startExit, MAX_READY_WAIT_MS);

    return () => {
      window.removeEventListener("load", onLoad);
      window.removeEventListener("gl-ready", onGlReady);
      window.clearTimeout(revealTimer);
      window.clearTimeout(earliestTimer);
      window.clearTimeout(capTimer);
      window.clearTimeout(mergeTimer);
      window.clearTimeout(finishTimer);
    };
  }, [completeIntro]);

  if (gone) return null;

  return (
    <div className="intro-loader" ref={rootRef} aria-hidden="true">
      <div className="intro-stage">
        <NexorWordmark variant="intro" />
      </div>
    </div>
  );
}
