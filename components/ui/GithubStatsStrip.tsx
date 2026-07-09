"use client";

import { useRef } from "react";
import { NO_MOTION_PREF, gsap, useGSAP } from "@/lib/animation";
import { formatRepoDate, type GithubSummary } from "@/lib/github";

export default function GithubStatsStrip({ github }: { github: GithubSummary }) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const lastPush = github.ok && github.repos.length > 0 ? github.repos[0].pushedAt : null;

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || !github.ok) return;
      const mm = gsap.matchMedia();

      mm.add(NO_MOTION_PREF, () => {
        gsap.from(".stat-cell", {
          autoAlpha: 0,
          y: 22,
          stagger: 0.1,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: { trigger: root, start: "top 82%" },
        });
        gsap.utils.toArray<HTMLElement>("[data-count]", root).forEach((el) => {
          const target = Number(el.dataset.count ?? "0");
          gsap.fromTo(
            el,
            { textContent: 0 },
            {
              textContent: target,
              snap: { textContent: 1 },
              duration: 1.4,
              ease: "power2.out",
              scrollTrigger: { trigger: root, start: "top 80%" },
            },
          );
        });
      });
    },
    { scope: rootRef },
  );

  return (
    <div ref={rootRef} className="stats-strip" aria-label="Live GitHub stats">
      <div className="stat-cell">
        <p className="stat-value" data-count={github.ok ? github.totals.repos : undefined}>
          {github.ok ? github.totals.repos : "—"}
        </p>
        <p className="stat-label">Public repos</p>
      </div>
      <div className="stat-cell">
        <p className="stat-value" data-count={github.ok ? github.totals.stars : undefined}>
          {github.ok ? github.totals.stars : "—"}
        </p>
        <p className="stat-label">Stars</p>
      </div>
      <div className="stat-cell">
        <p className="stat-value" data-count={github.ok ? github.totals.forks : undefined}>
          {github.ok ? github.totals.forks : "—"}
        </p>
        <p className="stat-label">Forks</p>
      </div>
      <div className="stat-cell">
        <p className="stat-value stat-value-text">{lastPush ? formatRepoDate(lastPush) : "—"}</p>
        <p className="stat-label">{github.ok ? "Last push · live from GitHub" : "GitHub"}</p>
      </div>
    </div>
  );
}
