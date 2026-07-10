"use client";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { CustomEase } from "gsap/CustomEase";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { TextPlugin } from "gsap/TextPlugin";

if (typeof window !== "undefined") {
  gsap.registerPlugin(
    useGSAP,
    ScrollTrigger,
    SplitText,
    DrawSVGPlugin,
    MotionPathPlugin,
    MorphSVGPlugin,
    CustomEase,
    ScrambleTextPlugin,
    TextPlugin,
  );

  if (!CustomEase.get("apple")) {
    CustomEase.create("apple", "0.32, 0.72, 0, 1");
    CustomEase.create("appleOut", "0.16, 1, 0.3, 1");
  }
}

export { gsap, useGSAP, ScrollTrigger, SplitText };

export const EASE = {
  out: "power4.out",
  soft: "power3.out",
  inOut: "power2.inOut",
  apple: "apple",
  appleOut: "appleOut",
} as const;

/** Pin distances (px of scroll); longer pins buy real dwell time per beat. */
export const PIN = {
  hero: 3200,
  heroMobile: 1600,
  pokyh: 3200,
  streamdeck: 4600,
  devops: 2600,
  future: 3000,
} as const;

/** Orbit project carousel: 5 items, 4 steps around the half circle. */
export const ORBIT = {
  stepDeg: 44,
  steps: 4,
  pin: 4800,
} as const;

export const BP_DESKTOP = "(min-width: 900px)";
export const BP_MOBILE = "(max-width: 899px)";
export const NO_MOTION_PREF = "(prefers-reduced-motion: no-preference)";

export const MM_DESKTOP = `${BP_DESKTOP} and ${NO_MOTION_PREF}`;
export const MM_MOBILE = `${BP_MOBILE} and ${NO_MOTION_PREF}`;
