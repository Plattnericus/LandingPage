/** Shared SVG goo filter — applied via CSS `filter: url(#goo-words)` so
    overlapping display words melt into each other like liquid. */
export default function GooDefs() {
  return (
    <svg className="goo-defs" aria-hidden="true" focusable="false">
      <defs>
        <filter id="goo-words">
          <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur" />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -14"
            result="goo"
          />
          <feComposite in="SourceGraphic" in2="goo" operator="atop" />
        </filter>
      </defs>
    </svg>
  );
}
