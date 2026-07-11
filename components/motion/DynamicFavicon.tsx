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

function drawGlyph(ctx: CanvasRenderingContext2D, glyph: GlyphId, color: string, scale: number) {
  ctx.save();
  ctx.translate(32, 32);
  ctx.scale(scale, scale);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const text = (value: string, size = 30) => {
    ctx.font = `700 ${size}px -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(value, 0, 2);
  };

  switch (glyph) {
    case "n":
      text("N");
      break;
    case "quote":
      ctx.beginPath();
      ctx.roundRect(-11, -10, 5, 20, 2.5);
      ctx.roundRect(-1, -10, 5, 20, 2.5);
      ctx.roundRect(9, -4, 5, 14, 2.5);
      ctx.fill();
      break;
    case "orbit":
      ctx.beginPath();
      ctx.arc(0, 0, 14, Math.PI * 0.75, Math.PI * 1.9);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(11, -8, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(-13, 6, 3, 0, Math.PI * 2);
      ctx.fill();
      break;
    case "grid":
      ctx.beginPath();
      ctx.roundRect(-13, -13, 11, 11, 3);
      ctx.roundRect(2, -13, 11, 11, 3);
      ctx.roundRect(-13, 2, 11, 11, 3);
      ctx.fill();
      ctx.globalAlpha = 0.55;
      ctx.beginPath();
      ctx.roundRect(2, 2, 11, 11, 3);
      ctx.fill();
      ctx.globalAlpha = 1;
      break;
    case "window":
      ctx.beginPath();
      ctx.roundRect(-14, -11, 28, 22, 4);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-14, -4);
      ctx.lineTo(14, -4);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(-9, -7.5, 1.6, 0, Math.PI * 2);
      ctx.arc(-4, -7.5, 1.6, 0, Math.PI * 2);
      ctx.fill();
      break;
    case "branch":
      ctx.beginPath();
      ctx.moveTo(-8, -12);
      ctx.lineTo(-8, 12);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-8, 0);
      ctx.quadraticCurveTo(2, 0, 8, -8);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(-8, -12, 4, 0, Math.PI * 2);
      ctx.arc(-8, 12, 4, 0, Math.PI * 2);
      ctx.arc(9, -10, 4, 0, Math.PI * 2);
      ctx.fill();
      break;
    case "shield":
      ctx.beginPath();
      ctx.moveTo(0, -14);
      ctx.lineTo(12, -9);
      ctx.lineTo(12, 2);
      ctx.quadraticCurveTo(12, 10, 0, 14);
      ctx.quadraticCurveTo(-12, 10, -12, 2);
      ctx.lineTo(-12, -9);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-5, 0);
      ctx.lineTo(-1, 4);
      ctx.lineTo(6, -4);
      ctx.stroke();
      break;
    case "braces":
      text("{ }", 22);
      break;
    case "arrow":
      ctx.beginPath();
      ctx.moveTo(-11, 11);
      ctx.lineTo(11, -11);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-1, -11);
      ctx.lineTo(11, -11);
      ctx.lineTo(11, 1);
      ctx.stroke();
      break;
    case "at":
      text("@", 28);
      break;
  }
  ctx.restore();
}

/**
 * Living browser tab: canvas favicon with a scroll progress ring whose glyph
 * and the document title swap per section; dims with a dot when the tab is
 * hidden and spins the ring when it returns.
 */
export default function DynamicFavicon() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    if (!ctx || typeof ctx.roundRect !== "function") return;

    const baseTitle = document.title;
    let links = Array.from(
      document.querySelectorAll<HTMLLinkElement>('link[rel="icon"], link[rel="shortcut icon"]'),
    );
    if (links.length === 0) {
      const link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
      links = [link];
    }

    let progress = 0;
    let glyph: GlyphId = "n";

    const draw = (mode: "active" | "hidden", spin = 0, pop = 1) => {
      ctx.clearRect(0, 0, 64, 64);

      ctx.beginPath();
      ctx.roundRect(2, 2, 60, 60, 16);
      ctx.fillStyle = PALETTE.tile;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(237, 224, 212, 0.18)";
      ctx.stroke();

      ctx.beginPath();
      ctx.lineWidth = 5;
      ctx.lineCap = "round";
      ctx.strokeStyle = mode === "hidden" ? "rgba(217, 119, 87, 0.5)" : TAN;
      const startAngle = -Math.PI / 2 + spin * Math.PI * 2;
      ctx.arc(32, 32, 25, startAngle, startAngle + Math.max(0.03, progress) * Math.PI * 2);
      ctx.stroke();

      drawGlyph(ctx, glyph, mode === "hidden" ? "rgba(242, 237, 230, 0.45)" : TEXT, pop);

      if (mode === "hidden") {
        ctx.beginPath();
        ctx.arc(50, 14, 6, 0, Math.PI * 2);
        ctx.fillStyle = SAND;
        ctx.fill();
      }

      const url = canvas.toDataURL("image/png");
      links.forEach((link) => {
        link.type = "image/png";
        link.href = url;
      });
    };

    draw("active");
    if (reduce) return;

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
      document.title = baseTitle;
    };
  }, []);

  return null;
}
