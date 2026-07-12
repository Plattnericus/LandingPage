"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/animation";
import { useSmoothScroll } from "@/components/providers/SmoothScrollProvider";
import {
  CLAWD_GIF,
  CLICK_REACTIONS,
  IDLE_FLAVOR,
  SCROLL_CLIPS,
  SECTION_CLIPS,
  type ClawdClip,
} from "@/lib/clawd";

/* Priorities: a state may only be replaced by an equal-or-higher one,
   or by anything once it expires. */
const PRIORITY: Record<string, number> = { idle: 0, flavor: 1, section: 2, velocity: 3, click: 4 };

type PetState = {
  clip: ClawdClip;
  kind: keyof typeof PRIORITY;
  until: number;
  bubble?: string;
};

const IDLE_STATE: PetState = { clip: "IDLE", kind: "idle", until: Infinity };

export default function ClawdPet() {
  const { lenisRef, introDone } = useSmoothScroll();
  const [state, setState] = useState<PetState>(IDLE_STATE);
  const [ready, setReady] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  /* propose() is the single entry into the state machine */
  const proposeRef = useRef((next: PetState) => {
    const current = stateRef.current;
    const expired = performance.now() > current.until;
    if (!expired && PRIORITY[next.kind] < PRIORITY[current.kind]) return;
    setState(next);
  });

  /* appear only after the intro, and only on motion-friendly desktops */
  useEffect(() => {
    if (!introDone) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cancelled = false;
    const markReady = () => {
      if (!cancelled) setReady(true);
    };

    const idleImg = new Image();
    idleImg.onload = markReady;
    idleImg.onerror = () => {
      /* one retry, then reveal the pet anyway on whatever the browser
         eventually resolves — a flaky first request must not permanently
         hide Clawd */
      window.setTimeout(() => {
        if (cancelled) return;
        const retry = new Image();
        retry.onload = markReady;
        retry.onerror = markReady;
        retry.src = CLAWD_GIF.IDLE;
      }, 600);
    };
    idleImg.src = CLAWD_GIF.IDLE;

    /* warm the rest of the clips off the critical path, but with a bounded
       timeout — a bare requestIdleCallback can get starved indefinitely
       while GSAP/ScrollTrigger/Three.js keep the main thread busy, which is
       exactly what let a freshly-clicked clip sometimes fail to have loaded
       yet. The timeout guarantees it fires within 2s regardless. */
    const rest = Object.values(CLAWD_GIF).filter((src) => src !== CLAWD_GIF.IDLE);
    const schedule = (cb: () => void) => {
      if (typeof window.requestIdleCallback === "function") {
        window.requestIdleCallback(cb, { timeout: 2000 });
      } else {
        window.setTimeout(cb, 400);
      }
    };
    schedule(() => {
      if (cancelled) return;
      rest.forEach((src) => {
        const img = new Image();
        img.src = src;
      });
    });

    return () => {
      cancelled = true;
    };
  }, [introDone]);

  /* behavior loops: flavor idles, scroll velocity, section context */
  useEffect(() => {
    if (!ready) return;
    const propose = proposeRef.current;

    /* random flavor every 12–20s */
    let flavorTimer: number;
    const scheduleFlavor = () => {
      flavorTimer = window.setTimeout(() => {
        const clip = IDLE_FLAVOR[Math.floor(Math.random() * IDLE_FLAVOR.length)];
        propose({ clip, kind: "flavor", until: performance.now() + 3200 });
        scheduleFlavor();
      }, 12000 + Math.random() * 8000);
    };
    scheduleFlavor();

    /* fast scrolling → a random work clip per burst (IDLE stays the baseline) */
    let velocityStart = 0;
    const onScroll = () => {
      const velocity = Math.abs(lenisRef.current?.velocity ?? 0);
      if (velocity > 40) {
        if (!velocityStart) velocityStart = performance.now();
        if (performance.now() - velocityStart > 250) {
          const current = stateRef.current;
          const stillScrolling =
            current.kind === "velocity" && performance.now() < current.until;
          const clip = stillScrolling
            ? current.clip
            : SCROLL_CLIPS[Math.floor(Math.random() * SCROLL_CLIPS.length)];
          propose({ clip, kind: "velocity", until: performance.now() + 1500 });
        }
      } else {
        velocityStart = 0;
      }
    };
    const scrollInterval = window.setInterval(onScroll, 200);

    /* section context via ScrollTrigger, same pattern as DynamicFavicon */
    const triggers = SECTION_CLIPS.flatMap(({ selector, clip }) => {
      const el = document.querySelector(selector);
      if (!el) return [];
      return [
        ScrollTrigger.create({
          trigger: el,
          start: "top 60%",
          end: "bottom 40%",
          onEnter: () =>
            propose({ clip, kind: "section", until: performance.now() + 4000 }),
          onEnterBack: () =>
            propose({ clip, kind: "section", until: performance.now() + 4000 }),
        }),
      ];
    });

    /* the hero occupies the same top-right corner Clawd spawns in — step
       aside while it's on screen instead of overlapping the wordmark. Set
       hidden synchronously rather than waiting for the trigger's first
       onToggle: Clawd only ever becomes ready right after the intro loader
       finishes, and scrolling is locked for the whole intro, so the hero is
       *always* on screen (scrollY 0) at that exact moment — no need for an
       async round-trip to know that, and no risk of a visible flash on a
       slow first ScrollTrigger refresh. */
    const hero = document.querySelector(".hero");
    if (hero) {
      const root = rootRef.current;
      if (root) gsap.set(root, { autoAlpha: 0 });
      triggers.push(
        ScrollTrigger.create({
          trigger: hero,
          start: "top top",
          end: "bottom top",
          onToggle: (self) => {
            if (!rootRef.current) return;
            const target = self.isActive ? 0 : 1;
            gsap.to(rootRef.current, { autoAlpha: target, duration: 0.35, overwrite: true });
          },
        }),
      );
    }

    /* fall back to IDLE whenever the active state expires */
    const expiry = window.setInterval(() => {
      const current = stateRef.current;
      if (current.kind !== "idle" && performance.now() > current.until) {
        setState(IDLE_STATE);
      }
    }, 500);

    return () => {
      window.clearTimeout(flavorTimer);
      window.clearInterval(scrollInterval);
      window.clearInterval(expiry);
      triggers.forEach((trigger) => trigger.kill());
    };
  }, [ready, lenisRef]);

  /* Swapping <img src> straight to state.clip flashes a blank frame on every
     change — the browser un-paints the old bitmap before the new GIF is
     decoded, which reads as a black flicker over the dark sections. Decode
     the next clip off-screen first and only repoint the visible <img> once
     it's actually paintable, so the old frame stays put until the new one
     can replace it with nothing in between. */
  const [displaySrc, setDisplaySrc] = useState(CLAWD_GIF.IDLE);
  useEffect(() => {
    const nextSrc = CLAWD_GIF[state.clip];
    let cancelled = false;
    const img = new Image();
    img.src = nextSrc;
    const swap = () => {
      if (!cancelled) setDisplaySrc(nextSrc);
    };
    if (typeof img.decode === "function") {
      img.decode().then(swap, swap);
    } else {
      img.onload = swap;
      img.onerror = swap;
    }
    return () => {
      cancelled = true;
    };
  }, [state.clip]);

  /* speech bubble pops in, then writes itself out letter by letter.
     useGSAP (not a raw useEffect) so cleanup/rebuild on every state change
     goes through gsap's own context revert instead of manual tl.kill() calls
     — the same pattern the rest of this codebase uses for React-driven GSAP
     timelines (see Hero.tsx), and it's StrictMode-safe by construction. */
  const bubbleRef = useRef<HTMLSpanElement | null>(null);
  useGSAP(
    () => {
      const el = bubbleRef.current;
      if (!el || !state.bubble) return;
      const letters = el.querySelectorAll(".clawd-bubble-letter");

      /* prefer above the sprite; flip below only when the viewport doesn't
         leave room — Clawd's default spawn sits close to the top edge, so
         that's the common case there, while a dragged-down Clawd gets the
         bubble above like normal. */
      const spriteTop = rootRef.current?.getBoundingClientRect().top ?? Infinity;
      const below = spriteTop < el.offsetHeight + 16;
      el.classList.toggle("clawd-bubble--below", below);
      const enterY = below ? -10 : 10;
      const exitY = below ? 8 : -8;

      const tl = gsap.timeline();
      tl.fromTo(
        el,
        { y: enterY, autoAlpha: 0, scale: 0.9 },
        { y: 0, autoAlpha: 1, scale: 1, duration: 0.3, ease: "back.out(2)" },
      ).fromTo(
        letters,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.01, stagger: 0.032, ease: "none" },
        0.1,
      );

      const lead = Math.max(200, state.until - performance.now() - 320);
      gsap.to(el, {
        y: exitY,
        autoAlpha: 0,
        duration: 0.3,
        ease: "power2.in",
        delay: lead / 1000,
      });
    },
    { dependencies: [state], scope: bubbleRef },
  );

  /* drag & drop: Clawd can be carried anywhere on screen */
  const dragMoved = useRef(false);
  const onPointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    const root = rootRef.current;
    if (!root) return;
    dragMoved.current = false;
    const rect = root.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const offsetY = event.clientY - rect.top;
    const startX = event.clientX;
    const startY = event.clientY;
    const sprite = event.currentTarget;
    sprite.setPointerCapture(event.pointerId);

    const onMove = (move: PointerEvent) => {
      if (Math.hypot(move.clientX - startX, move.clientY - startY) > 6) {
        dragMoved.current = true;
      }
      if (!dragMoved.current) return;
      const x = Math.min(
        Math.max(move.clientX - offsetX, 8),
        window.innerWidth - rect.width - 8,
      );
      const y = Math.min(
        Math.max(move.clientY - offsetY, 8),
        window.innerHeight - rect.height - 8,
      );
      root.style.left = `${x}px`;
      root.style.right = "auto";
      root.style.bottom = "auto";
      root.style.top = `${y}px`;
    };
    const onUp = () => {
      sprite.releasePointerCapture(event.pointerId);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      /* pointer-driven focus still satisfies some browsers' :focus-visible
         heuristic (Chromium keeps the ring after a drag more readily than
         after a plain click) — drop it immediately so mouse/touch users
         never see the keyboard focus ring; real keyboard Tab focus re-shows
         it normally, since that's a separate focus event fired after this. */
      sprite.blur();
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const onClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (dragMoved.current) return; // a drag is not a click
    event.currentTarget.blur();
    const reaction = CLICK_REACTIONS[Math.floor(Math.random() * CLICK_REACTIONS.length)];
    proposeRef.current({
      clip: reaction.clip,
      kind: "click",
      until: performance.now() + 2600,
      bubble: reaction.line,
    });
  };

  if (!ready) return null;

  return (
    <div className="clawd-pet" aria-hidden={false} ref={rootRef}>
      {/* bubble is absolutely positioned off the sprite (see .clawd-bubble),
          so it can never push the sprite itself out of position */}
      <button
        type="button"
        className="clawd-sprite"
        onClick={onClick}
        onPointerDown={onPointerDown}
        aria-label="Clawd, the site mascot — click for a reaction, drag to move him"
      >
        {/* plain <img>: animated GIFs must not go through next/image optimization */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={displaySrc} alt="" width={96} height={96} draggable={false} />
      </button>
      {state.bubble && (
        <span className="clawd-bubble" ref={bubbleRef}>
          {state.bubble.split("").map((char, index) => (
            <span className="clawd-bubble-letter" key={index}>
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
        </span>
      )}
    </div>
  );
}
