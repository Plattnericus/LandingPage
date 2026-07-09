"use client";

import { useId, useRef } from "react";
import { NO_MOTION_PREF, ScrollTrigger, gsap, useGSAP } from "@/lib/animation";

const BLOB_A =
  "M437.5,320.5Q416,391,351.5,430.5Q287,470,215,438Q143,406,120.5,331.5Q98,257,146.5,193.5Q195,130,272,116Q349,102,404,158Q459,214,437.5,320.5Z";
const BLOB_B =
  "M441,317Q400,384,334,425Q268,466,197,431Q126,396,102,323Q78,250,116,180Q154,110,233,96Q312,82,378,124Q444,166,453,233Q462,300,441,317Z";
const BLOB_C =
  "M418,301Q409,362,357,404Q305,446,234,441Q163,436,120,373Q77,310,97,236Q117,162,183,124Q249,86,322,105Q395,124,416,187Q437,250,418,301Z";

type LiquidBlobProps = {
  className?: string;
  /** 0..1 fill strength of the warm gradient. */
  strength?: number;
  /** Gooey filter: main and echo blob melt into each other while drifting. */
  goo?: boolean;
};

/** Slowly morphing liquid blob (MorphSVG), warm caramel tones, animates only in view. */
export default function LiquidBlob({ className, strength = 0.32, goo = false }: LiquidBlobProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const gradientId = useId().replace(/[:]/g, "");
  const gooId = `goo-${gradientId}`;

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const mm = gsap.matchMedia();

      mm.add(NO_MOTION_PREF, () => {
        const main = root.querySelector(".liquid-main");
        const echo = root.querySelector(".liquid-echo");
        if (!main || !echo) return;

        const morph = gsap
          .timeline({ repeat: -1, yoyo: true, paused: true, defaults: { ease: "sine.inOut" } })
          .to(main, { morphSVG: BLOB_B, duration: 8 })
          .to(main, { morphSVG: BLOB_C, duration: 9 });
        const echoMorph = gsap
          .timeline({ repeat: -1, yoyo: true, paused: true, defaults: { ease: "sine.inOut" } })
          .to(echo, { morphSVG: BLOB_C, duration: 7 })
          .to(echo, { morphSVG: BLOB_B, duration: 8 });
        const spin = gsap.to(root.querySelector("svg"), {
          rotation: 360,
          duration: 120,
          ease: "none",
          repeat: -1,
          paused: true,
        });
        const drift = gsap.to(echo, {
          x: 46,
          y: -30,
          duration: 11,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          paused: true,
        });

        const all = [morph, echoMorph, spin, drift];
        ScrollTrigger.create({
          trigger: root,
          start: "top bottom",
          end: "bottom top",
          onToggle: (self) => all.forEach((anim) => (self.isActive ? anim.play() : anim.pause())),
        });
      });
    },
    { scope: rootRef },
  );

  return (
    <div
      ref={rootRef}
      className={`liquid ${goo ? "liquid-goo" : ""} ${className ?? ""}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 560 560" fill="none">
        <defs>
          <radialGradient id={gradientId} cx="50%" cy="42%" r="62%">
            <stop offset="0%" stopColor="#e6ccb2" stopOpacity={strength} />
            <stop offset="55%" stopColor="#ddb892" stopOpacity={strength * 0.55} />
            <stop offset="100%" stopColor="#b08968" stopOpacity="0" />
          </radialGradient>
          {goo ? (
            <filter id={gooId}>
              <feGaussianBlur in="SourceGraphic" stdDeviation="16" result="blur" />
              <feColorMatrix
                in="blur"
                type="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -11"
              />
            </filter>
          ) : null}
        </defs>
        <g filter={goo ? `url(#${gooId})` : undefined}>
          <path className="liquid-main" d={BLOB_A} fill={`url(#${gradientId})`} />
          <path
            className="liquid-echo"
            d={BLOB_B}
            fill={`url(#${gradientId})`}
            opacity="0.7"
            transform="translate(70 40) scale(0.62)"
          />
        </g>
      </svg>
    </div>
  );
}
