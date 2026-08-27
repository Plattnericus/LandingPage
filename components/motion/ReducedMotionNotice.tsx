"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { detectOS, type OS } from "./osDetect";
import { COPY, RTL_LANGS, detectLang, type Lang } from "./reducedMotionCopy";

/* Bump this if the copy changes enough that a visitor who dismissed the old
   wording should see the new one once. */
const DISMISS_KEY = "motion-notice-dismissed-v1";

type Shown = { os: OS; lang: Lang };

/** A visitor with reduced motion enabled sees this site's calm, fully static
    page on purpose — see GLCanvas/ClawdPet/IntroLoader, which all skip
    themselves for exactly that preference. That's the right default for
    someone who set it for real accessibility reasons, but plenty of people
    have it on by accident (an OS default, a battery-saver toggle) and have
    no idea it's why a site looks "broken." This is a one-time, easily
    dismissed explanation, not a nag — it never reappears once closed, and
    it makes no judgment about which state is correct for the visitor.

    The language is read straight from the browser on every visit, same as
    prefers-reduced-motion itself — there's deliberately no switcher and
    nothing persisted for it, only the dismissal is remembered. */
export default function ReducedMotionNotice() {
  const [shown, setShown] = useState<Shown | null>(null);

  useEffect(() => {
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    try {
      if (window.localStorage.getItem(DISMISS_KEY) === "1") return;
    } catch {
      /* private browsing etc. — fall through and show it anyway */
    }
    /* deferred a frame so setState stays out of the effect body itself */
    const raf = requestAnimationFrame(() => setShown({ os: detectOS(), lang: detectLang() }));
    return () => cancelAnimationFrame(raf);
  }, []);

  if (!shown) return null;

  const dismiss = () => {
    setShown(null);
    try {
      window.localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* nothing to persist to — it just shows again next visit */
    }
  };

  const copy = COPY[shown.lang];
  const rtl = RTL_LANGS.has(shown.lang);

  return (
    <div className="motion-notice" role="status">
      <p dir={rtl ? "rtl" : undefined}>{copy.body(shown.os)}</p>
      <button type="button" className="motion-notice-close" onClick={dismiss} aria-label={copy.dismiss}>
        <X aria-hidden="true" />
      </button>
    </div>
  );
}
