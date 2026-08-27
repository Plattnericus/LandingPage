"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

/* Bump this if the copy changes enough that a visitor who dismissed the old
   wording should see the new one once. */
const DISMISS_KEY = "motion-notice-dismissed-v1";

type OS = "windows" | "mac" | "other";

function detectOS(): OS {
  if (typeof navigator === "undefined") return "other";
  const signal = `${navigator.platform} ${navigator.userAgent}`;
  if (/mac/i.test(signal)) return "mac";
  if (/win/i.test(signal)) return "windows";
  return "other";
}

const INSTRUCTIONS: Record<OS, string> = {
  windows: "Settings → Accessibility → Visual effects → Animation effects",
  mac: "System Settings → Accessibility → Display → Reduce motion",
  other: "your device's accessibility or display settings, under something like “reduce motion”",
};

/** A visitor with reduced motion enabled sees this site's calm, fully static
    page on purpose — see GLCanvas/ClawdPet/IntroLoader, which all skip
    themselves for exactly that preference. That's the right default for
    someone who set it for real accessibility reasons, but plenty of people
    have it on by accident (an OS default, a battery-saver toggle) and have
    no idea it's why a site looks "broken." This is a one-time, easily
    dismissed explanation, not a nag — it never reappears once closed, and
    it makes no judgment about which state is correct for the visitor. */
export default function ReducedMotionNotice() {
  const [os, setOs] = useState<OS | null>(null);

  useEffect(() => {
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    try {
      if (window.localStorage.getItem(DISMISS_KEY) === "1") return;
    } catch {
      /* private browsing etc. — fall through and show it anyway */
    }
    /* deferred a frame so setState stays out of the effect body itself */
    const raf = requestAnimationFrame(() => setOs(detectOS()));
    return () => cancelAnimationFrame(raf);
  }, []);

  if (!os) return null;

  const dismiss = () => {
    setOs(null);
    try {
      window.localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* nothing to persist to — it just shows again next visit */
    }
  };

  return (
    <div className="motion-notice" role="status">
      <p>
        This device has reduced motion turned on, so this page is showing its calm, static
        version on purpose — no 3D scene, mascot, or scroll animation. If that wasn&apos;t
        intentional, flip it back on in {INSTRUCTIONS[os]}, then reload this page to see it.
      </p>
      <button type="button" className="motion-notice-close" onClick={dismiss} aria-label="Dismiss this notice">
        <X aria-hidden="true" />
      </button>
    </div>
  );
}
