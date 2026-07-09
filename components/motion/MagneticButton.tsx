"use client";

import { useRef, type ReactNode } from "react";
import { NO_MOTION_PREF, gsap, useGSAP } from "@/lib/animation";

type MagneticButtonProps = {
  children: ReactNode;
  href?: string;
  external?: boolean;
  variant?: "primary" | "ghost";
  icon?: ReactNode;
  className?: string;
  ariaLabel?: string;
};

export default function MagneticButton({
  children,
  href,
  external = false,
  variant = "ghost",
  icon,
  className,
  ariaLabel,
}: MagneticButtonProps) {
  const rootRef = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      const el = rootRef.current;
      if (!el) return;
      const mm = gsap.matchMedia();

      mm.add(`(pointer: fine) and ${NO_MOTION_PREF}`, () => {
        const label = el.querySelector<HTMLElement>(".btn-label");
        const xTo = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3.out" });
        const yTo = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3.out" });
        const labelX = label ? gsap.quickTo(label, "x", { duration: 0.5, ease: "power3.out" }) : null;
        const labelY = label ? gsap.quickTo(label, "y", { duration: 0.5, ease: "power3.out" }) : null;

        const onMove = (event: PointerEvent) => {
          const rect = el.getBoundingClientRect();
          const relX = event.clientX - (rect.left + rect.width / 2);
          const relY = event.clientY - (rect.top + rect.height / 2);
          xTo(gsap.utils.clamp(-26, 26, relX * 0.38));
          yTo(gsap.utils.clamp(-16, 16, relY * 0.38));
          labelX?.(gsap.utils.clamp(-10, 10, relX * 0.14));
          labelY?.(gsap.utils.clamp(-7, 7, relY * 0.14));
        };
        const onEnter = () => {
          gsap.to(el, { scale: 1.045, duration: 0.35, ease: "power3.out" });
        };
        const onLeave = () => {
          xTo(0);
          yTo(0);
          labelX?.(0);
          labelY?.(0);
          gsap.to(el, { scale: 1, duration: 0.7, ease: "elastic.out(1, 0.55)" });
        };

        el.addEventListener("pointermove", onMove);
        el.addEventListener("pointerenter", onEnter);
        el.addEventListener("pointerleave", onLeave);

        return () => {
          el.removeEventListener("pointermove", onMove);
          el.removeEventListener("pointerenter", onEnter);
          el.removeEventListener("pointerleave", onLeave);
        };
      });
    },
    { scope: rootRef },
  );

  const classes = ["btn", variant === "primary" ? "btn-primary" : "", className ?? ""]
    .filter(Boolean)
    .join(" ");

  const content = (
    <span className="btn-label">
      {children}
      {icon}
    </span>
  );

  if (href) {
    return (
      <a
        ref={(node) => {
          rootRef.current = node;
        }}
        className={classes}
        href={href}
        aria-label={ariaLabel}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      ref={(node) => {
        rootRef.current = node;
      }}
      type="button"
      className={classes}
      aria-label={ariaLabel}
    >
      {content}
    </button>
  );
}
