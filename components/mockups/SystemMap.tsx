/**
 * Infrastructure system map drawn by GSAP (DrawSVG on .map-line, staggered
 * .map-node pops, .map-label fades, .map-pulse dots on MotionPath).
 */
export default function SystemMap({ className }: { className?: string }) {
  return (
    <svg
      className={`system-map ${className ?? ""}`}
      viewBox="0 0 1200 640"
      fill="none"
      aria-hidden="true"
    >
      {/* connections */}
      <path id="map-route" className="map-line" d="M150 320 C 260 220, 330 200, 440 240 S 640 330, 750 300 S 950 240, 1020 300" />
      <path className="map-line" d="M1020 340 C 1000 420, 960 450, 900 470" />
      <path className="map-line" d="M1020 340 C 1050 420, 1080 450, 1120 470" />
      <path className="map-line" d="M900 500 L 1010 540" />

      {/* client */}
      <circle cx="150" cy="320" r="34" className="map-node" />
      <text x="150" y="388" textAnchor="middle" className="map-label">
        Client
      </text>

      {/* cloudflare */}
      <rect x="380" y="204" width="130" height="64" rx="16" className="map-node" />
      <text x="445" y="245" textAnchor="middle" className="map-label on-node">
        Cloudflare
      </text>

      {/* reverse proxy */}
      <rect x="680" y="266" width="150" height="64" rx="16" className="map-node" />
      <text x="755" y="307" textAnchor="middle" className="map-label on-node">
        Nginx
      </text>

      {/* VPS boundary */}
      <rect x="860" y="250" width="320" height="330" rx="22" className="map-node map-vps" />
      <text x="1020" y="292" textAnchor="middle" className="map-label">
        VPS · Docker
      </text>

      {/* containers */}
      <rect x="884" y="430" width="120" height="58" rx="12" className="map-node map-container" />
      <text x="944" y="466" textAnchor="middle" className="map-label on-node">
        web
      </text>
      <rect x="1064" y="430" width="96" height="58" rx="12" className="map-node map-container" />
      <text x="1112" y="466" textAnchor="middle" className="map-label on-node">
        api
      </text>
      <rect x="960" y="512" width="100" height="56" rx="12" className="map-node map-container" />
      <text x="1010" y="547" textAnchor="middle" className="map-label on-node">
        db
      </text>

      {/* pulses traveling the main route */}
      <circle r="6" className="map-pulse" />
      <circle r="4" className="map-pulse" />
    </svg>
  );
}
