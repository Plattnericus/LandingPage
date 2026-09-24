"use client";

import { useEffect } from "react";
import { ScrollTrigger, gsap } from "@/lib/animation";
import { PALETTE } from "@/lib/palette";

type GlyphId =
  | "n"
  | "quote"
  | "orbit"
  | "grid"
  | "window"
  | "branch"
  | "shield"
  | "braces"
  | "arrow"
  | "at";

type SectionMeta = { selector: string; titles: string[]; glyph: GlyphId };

/** Empty titles array = restore the document's original title. */
const SECTIONS: SectionMeta[] = [
  { selector: ".hero", titles: [], glyph: "n" },
  {
    selector: ".why",
    titles: ["Why full stack? — Nexor", "Every layer, one developer."],
    glyph: "braces",
  },
  {
    selector: ".showcase",
    titles: ["Nexor runs live.", "Not mockups — deployments."],
    glyph: "orbit",
  },
  {
    selector: ".rethink",
    titles: ["Enter Nexor.", "Web experiences, done right."],
    glyph: "arrow",
  },
  {
    selector: ".solution",
    titles: ["Fast. Secure. Deployed. — Nexor"],
    glyph: "quote",
  },
  {
    selector: ".heat",
    titles: ["Nexor brings the heat.", "01 → 07, all real skills."],
    glyph: "shield",
  },
  {
    selector: ".footer-giant",
    titles: ["Open to projects and ideas.", "Say hello. — Nexor"],
    glyph: "at",
  },
];

const HIDDEN_TITLES = [
  "Come back — Nexor misses you.",
  "Still deploying over here…",
  "Your scroll is paused. — Nexor",
  "The pipeline waits for no tab.",
];

const TAN = PALETTE.accent;
const SAND = PALETTE.accentSoft;
const TEXT = PALETTE.light;

const FONT = "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif";

/** Canvas-style arc (clockwise, angles in radians) as an SVG path. */
function arcPath(cx: number, cy: number, r: number, from: number, to: number) {
  const x0 = cx + r * Math.cos(from);
  const y0 = cy + r * Math.sin(from);
  const x1 = cx + r * Math.cos(to);
  const y1 = cy + r * Math.sin(to);
  const large = to - from > Math.PI ? 1 : 0;
  return `M${x0.toFixed(2)} ${y0.toFixed(2)}A${r} ${r} 0 ${large} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
}

/** The section glyph, drawn around (0, 0) in a 64-unit tile. */
function glyphSvg(glyph: GlyphId, color: string) {
  const text = (value: string, size = 30) =>
    `<text x="0" y="2" fill="${color}" font-family="${FONT}" font-weight="700" font-size="${size}" text-anchor="middle" dominant-baseline="central">${value}</text>`;
  const stroke = `fill="none" stroke="${color}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"`;
  switch (glyph) {
    case "n":
      return text("N");
    case "quote":
      return `<g fill="${color}"><rect x="-11" y="-10" width="5" height="20" rx="2.5"/><rect x="-1" y="-10" width="5" height="20" rx="2.5"/><rect x="9" y="-4" width="5" height="14" rx="2.5"/></g>`;
    case "orbit":
      return `<path d="${arcPath(0, 0, 14, Math.PI * 0.75, Math.PI * 1.9)}" ${stroke}/><circle cx="11" cy="-8" r="4.5" fill="${color}"/><circle cx="-13" cy="6" r="3" fill="${color}"/>`;
    case "grid":
      return `<g fill="${color}"><rect x="-13" y="-13" width="11" height="11" rx="3"/><rect x="2" y="-13" width="11" height="11" rx="3"/><rect x="-13" y="2" width="11" height="11" rx="3"/><rect x="2" y="2" width="11" height="11" rx="3" opacity="0.55"/></g>`;
    case "window":
      return `<rect x="-14" y="-11" width="28" height="22" rx="4" ${stroke}/><path d="M-14 -4H14" ${stroke}/><circle cx="-9" cy="-7.5" r="1.6" fill="${color}"/><circle cx="-4" cy="-7.5" r="1.6" fill="${color}"/>`;
    case "branch":
      return `<path d="M-8 -12V12M-8 0Q2 0 8 -8" ${stroke}/><g fill="${color}"><circle cx="-8" cy="-12" r="4"/><circle cx="-8" cy="12" r="4"/><circle cx="9" cy="-10" r="4"/></g>`;
    case "shield":
      return `<path d="M0 -14L12 -9V2Q12 10 0 14Q-12 10 -12 2V-9Z" ${stroke}/><path d="M-5 0L-1 4L6 -4" ${stroke}/>`;
    case "braces":
      return text("{ }", 22);
    case "arrow":
      return `<path d="M-11 11L11 -11M-1 -11H11V1" ${stroke}/>`;
    case "at":
      return text("@", 28);
  }
}

/**
 * Living browser tab: SVG favicon with a scroll progress ring whose glyph
 * and the document title swap per section; dims with a dot when the tab is
 * hidden and spins the ring when it returns.
 */
export default function DynamicFavicon() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const baseTitle = document.title;

    /* Next's App Router metadata (the static app/icon.tsx + favicon.ico
       links) can be re-inserted into <head> by the client runtime after
       this effect has already taken over the original tags — e.g. right
       after a Fast Refresh or a client-only metadata resolution pass. Those
       fresh copies silently outrank our live one and the tab reverts
       to the static "N" tile. This used to delete the rival tags outright,
       but React 19 hoists and tracks <link> tags itself; ripping one out
       from under it left React holding a reference to an already-detached
       node, and its next reconciliation pass crashed trying to remove a
       child from a parent that was already null. Repointing every matching
       tag's href instead — never removing a node React didn't hand us — gets
       the same visual result without fighting React for ownership. */
    const claimFavicon = (url: string) => {
      const links = document.querySelectorAll<HTMLLinkElement>(
        'link[rel="icon"], link[rel="shortcut icon"]',
      );
      if (links.length === 0) {
        const link = document.createElement("link");
        link.rel = "icon";
        link.type = "image/svg+xml";
        link.href = url;
        document.head.appendChild(link);
        return;
      }
      links.forEach((link) => {
        link.type = "image/svg+xml";
        link.href = url;
      });
    };
    let lastUrl = "";

    /* The icon is an SVG string, not a canvas: a frame costs a few string
       concatenations instead of a PNG encode on the main thread (which used
       to run up to 60 times a second mid-scroll). Frames are still coalesced
       to at most one every PUBLISH_MS, because each new icon also makes the
       browser reload its tab icon; the latest frame always wins. */
    const PUBLISH_MS = 100;
    let cancelled = false;
    let latest = "";
    let publishTimer = 0;
    let lastPublish = -Infinity;
    const flush = () => {
      publishTimer = 0;
      if (cancelled || !latest || latest === lastUrl) return;
      lastPublish = performance.now();
      lastUrl = latest;
      claimFavicon(latest);
    };
    const publish = (url: string) => {
      latest = url;
      if (publishTimer) return;
      const wait = PUBLISH_MS - (performance.now() - lastPublish);
      if (wait <= 0) flush();
      else publishTimer = window.setTimeout(flush, wait);
    };

    let progress = 0;
    let glyph: GlyphId = "n";

    const draw = (mode: "active" | "hidden", spin = 0, pop = 1) => {
      const ringStart = -Math.PI / 2 + spin * Math.PI * 2;
      const ring = arcPath(32, 32, 25, ringStart, ringStart + Math.max(0.03, progress) * Math.PI * 2);
      const glyphColor = mode === "hidden" ? "rgba(242, 237, 230, 0.45)" : TEXT;
      const svg =
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">` +
        `<rect x="2" y="2" width="60" height="60" rx="16" fill="${PALETTE.tile}" stroke="rgba(237, 224, 212, 0.18)" stroke-width="2"/>` +
        `<path d="${ring}" fill="none" stroke="${mode === "hidden" ? "rgba(217, 119, 87, 0.5)" : TAN}" stroke-width="5" stroke-linecap="round"/>` +
        `<g transform="translate(32 32) scale(${pop.toFixed(3)})">${glyphSvg(glyph, glyphColor)}</g>` +
        (mode === "hidden" ? `<circle cx="50" cy="14" r="6" fill="${SAND}"/>` : "") +
        `</svg>`;
      publish(`data:image/svg+xml,${encodeURIComponent(svg)}`);
    };

    draw("active");

    /* Catches any rel="icon" tag inserted after this point (Next's own
       re-insertion, a Fast Refresh, another script) and repoints it to the
       current frame the same tick, so the tab icon can never drift back to
       a static one. */
    const headObserver = new MutationObserver(() => {
      if (lastUrl) claimFavicon(lastUrl);
    });
    headObserver.observe(document.head, { childList: true });

    if (reduce) {
      return () => {
        cancelled = true;
        headObserver.disconnect();
      };
    }

    const triggers: ScrollTrigger[] = [];
    const popProxy = { value: 1 };
    let popTween: gsap.core.Tween | null = null;
    let typeTween: gsap.core.Tween | null = null;
    let currentTitle = baseTitle;

    /* typewriter title swap — the closest thing to a GSAP tween a tab allows */
    const typeTitle = (text: string) => {
      currentTitle = text;
      typeTween?.kill();
      if (document.hidden) return;
      const proxy = { n: 0 };
      typeTween = gsap.to(proxy, {
        n: text.length,
        duration: Math.min(1.1, 0.28 + text.length * 0.028),
        ease: "none",
        snap: { n: 1 },
        onUpdate: () => {
          document.title = proxy.n < text.length ? `${text.slice(0, proxy.n)}▌` : text;
        },
        onComplete: () => {
          document.title = text;
        },
      });
    };

    const setSection = (meta: SectionMeta) => {
      if (glyph === meta.glyph) return;
      glyph = meta.glyph;
      const pool = meta.titles.length ? meta.titles : [baseTitle];
      typeTitle(pool[Math.floor(Math.random() * pool.length)]);
      popTween?.kill();
      popProxy.value = 0.4;
      popTween = gsap.to(popProxy, {
        value: 1,
        duration: 0.5,
        ease: "back.out(2.4)",
        onUpdate: () => {
          if (!document.hidden) draw("active", 0, popProxy.value);
        },
      });
    };

    SECTIONS.forEach((meta) => {
      const el = document.querySelector(meta.selector);
      if (!el) return;
      triggers.push(
        ScrollTrigger.create({
          trigger: el,
          start: "top 55%",
          end: "bottom 45%",
          onToggle: (self) => {
            if (self.isActive) setSection(meta);
          },
        }),
      );
    });

    let lastDrawn = 0;
    triggers.push(
      ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (self) => {
          progress = self.progress;
          if (Math.abs(progress - lastDrawn) > 0.02 && !document.hidden) {
            lastDrawn = progress;
            draw("active");
          }
        },
      }),
    );

    const spinProxy = { value: 0 };
    let spinTween: gsap.core.Tween | null = null;
    const onVisibility = () => {
      if (document.hidden) {
        spinTween?.kill();
        typeTween?.kill();
        document.title = HIDDEN_TITLES[Math.floor(Math.random() * HIDDEN_TITLES.length)];
        draw("hidden");
      } else {
        spinProxy.value = 0;
        spinTween = gsap.to(spinProxy, {
          value: 1,
          duration: 0.8,
          ease: "power2.out",
          onUpdate: () => draw("active", spinProxy.value),
        });
        typeTitle(currentTitle);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      triggers.forEach((trigger) => trigger.kill());
      spinTween?.kill();
      popTween?.kill();
      typeTween?.kill();
      document.removeEventListener("visibilitychange", onVisibility);
      headObserver.disconnect();
      cancelled = true;
      window.clearTimeout(publishTimer);
      document.title = baseTitle;
    };
  }, []);

  return null;
}
