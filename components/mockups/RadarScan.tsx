/** Radar panel: rings drawn via DrawSVG, a conic sweep rotated by GSAP,
    blips popped in sequence, one mono status line scrambled in. */
export default function RadarScan() {
  return (
    <div className="radar" aria-hidden="true">
      <svg viewBox="0 0 300 300" fill="none">
        <circle cx="150" cy="150" r="132" className="radar-ring" />
        <circle cx="150" cy="150" r="92" className="radar-ring" />
        <circle cx="150" cy="150" r="52" className="radar-ring" />
        <line x1="150" y1="18" x2="150" y2="282" className="radar-ring thin" />
        <line x1="18" y1="150" x2="282" y2="150" className="radar-ring thin" />
        <circle cx="196" cy="104" r="5" className="radar-blip" />
        <circle cx="104" cy="192" r="4" className="radar-blip" />
        <circle cx="184" cy="204" r="3.5" className="radar-blip" />
      </svg>
      <span className="radar-sweep" />
      <p className="radar-status mono" />
    </div>
  );
}
