import { Flag } from "lucide-react";
import type { ProjectVisualId } from "@/lib/projects";

/* Deterministic minesweeper board (9 x 6). Values: number = revealed count,
   "f" = flag, undefined = raised tile. No randomness — SSR/client must match. */
const MINE_COLS = 9;
const MINE_ROWS = 6;
const MINE_REVEALED: Record<number, number> = {
  10: 1,
  11: 2,
  12: 1,
  19: 1,
  20: 0,
  21: 2,
  28: 1,
  29: 1,
  30: 3,
  38: 1,
  39: 2,
};
const MINE_FLAGS = new Set([13, 31]);

function PokyhVisual() {
  return (
    <div className="pv pv-pokyh">
      <div className="pv-pokyh-screen">
        <div className="pv-pokyh-sidebar">
          <span className="pv-dot" />
          <span className="pv-line w60" />
          <span className="pv-line w80" />
          <span className="pv-line w50" />
          <span className="pv-line w70" />
        </div>
        <div className="pv-pokyh-grid">
          {Array.from({ length: 15 }, (_, i) => (
            <span key={i} className={`pv-cell ${i % 4 === 1 ? "is-accent" : ""}`} />
          ))}
        </div>
      </div>
      <div className="pv-pokyh-phone">
        <span className="pv-notch" />
        <span className="pv-line w70" />
        <span className="pv-row" />
        <span className="pv-row" />
        <span className="pv-row is-accent" />
        <span className="pv-row" />
      </div>
    </div>
  );
}

function StreamdeckVisual() {
  return (
    <div className="pv pv-streamdeck">
      <div className="pv-menubar">
        <span className="pv-dot" />
        <span className="pv-line w30" />
      </div>
      <div className="pv-window pv-window-list">
        <div className="pv-window-bar">
          <span className="pv-traffic" />
          <span className="pv-traffic" />
          <span className="pv-traffic" />
        </div>
        <span className="pv-line w80" />
        <span className="pv-line w60" />
        <span className="pv-line w70" />
      </div>
      <div className="pv-window pv-window-terminal">
        <div className="pv-window-bar">
          <span className="pv-traffic" />
          <span className="pv-traffic" />
          <span className="pv-traffic" />
        </div>
        <p className="mono">$ npm run dev</p>
        <p className="mono is-accent">ready in 412ms</p>
      </div>
      <div className="pv-dock">
        <span className="pv-dock-dot" />
        <span className="pv-dock-dot" />
        <span className="pv-dock-dot" />
        <span className="pv-dock-dot" />
      </div>
    </div>
  );
}

function MagicMirrorVisual() {
  return (
    <div className="pv pv-mirror">
      <p className="pv-mirror-clock">07:42</p>
      <p className="pv-mirror-date">Wednesday, July 9</p>
      <div className="pv-mirror-rows">
        <span className="pv-line w60" />
        <span className="pv-line w80" />
        <span className="pv-line w50" />
      </div>
      <span className="pv-mirror-sheen" />
    </div>
  );
}

function MinesweeperVisual() {
  return (
    <div className="pv pv-mines">
      <div className="pv-mines-grid">
        {Array.from({ length: MINE_COLS * MINE_ROWS }, (_, i) => {
          const value = MINE_REVEALED[i];
          if (MINE_FLAGS.has(i)) {
            return (
              <span key={i} className="pv-tile is-flag">
                <Flag aria-hidden="true" />
              </span>
            );
          }
          if (value !== undefined) {
            return (
              <span key={i} className={`pv-tile is-open n${value}`}>
                {value > 0 ? value : ""}
              </span>
            );
          }
          return <span key={i} className="pv-tile" />;
        })}
      </div>
    </div>
  );
}

function ProjectileVisual() {
  return (
    <div className="pv pv-projectile">
      <svg viewBox="0 0 400 260" fill="none" aria-hidden="true">
        <line x1="16" y1="216" x2="384" y2="216" className="pv-ground" />
        <rect x="34" y="184" width="32" height="32" rx="4" className="pv-block" />
        <rect x="66" y="200" width="16" height="16" rx="3" className="pv-block dim" />
        <rect x="316" y="200" width="16" height="16" rx="3" className="pv-block dim" />
        <path d="M66 184 Q 200 24 344 176" className="arc-path" />
        <circle cx="344" cy="176" r="14" className="pv-reticle pv-reticle-pulse" />
        <line x1="344" y1="156" x2="344" y2="166" className="pv-reticle" />
        <line x1="344" y1="186" x2="344" y2="196" className="pv-reticle" />
        <line x1="324" y1="176" x2="334" y2="176" className="pv-reticle" />
        <line x1="354" y1="176" x2="364" y2="176" className="pv-reticle" />
      </svg>
    </div>
  );
}

export default function ProjectVisual({ id }: { id: ProjectVisualId }) {
  switch (id) {
    case "pokyh":
      return <PokyhVisual />;
    case "streamdeck":
      return <StreamdeckVisual />;
    case "magic-mirror":
      return <MagicMirrorVisual />;
    case "minesweeper":
      return <MinesweeperVisual />;
    case "projectile":
      return <ProjectileVisual />;
  }
}
