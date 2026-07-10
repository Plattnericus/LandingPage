/**
 * Infrastructure system map drawn by GSAP (DrawSVG on .map-line, staggered
 * .map-node pops, .map-label fades, .map-pulse dots on MotionPath).
 * Sized for the POKYH stage (~1.15:1) with the Docker/VPS box as the star.
 */
export default function SystemMap({ className }: { className?: string }) {
  return (
    <svg
      className={`system-map ${className ?? ""}`}
      viewBox="0 0 800 640"
      fill="none"
      aria-hidden="true"
    >
      {/* main route: client → cloudflare → nginx → docker/vps edge */}
      <path
        id="map-route"
        className="map-line"
        d="M110 96 C 210 48, 300 56, 385 92 C 470 128, 570 128, 645 170 C 700 202, 680 246, 620 282 C 570 310, 480 316, 430 328"
      />
      <path className="map-line" d="M360 498 C 380 502, 440 508, 460 512" />
      <path className="map-line" d="M600 498 C 580 502, 520 508, 500 512" />

      {/* client */}
      <circle cx="110" cy="96" r="36" className="map-node" />
      <text x="110" y="168" textAnchor="middle" className="map-label">
        Client
      </text>

      {/* cloudflare */}
      <rect x="300" y="58" width="172" height="68" rx="18" className="map-node" />
      <text x="386" y="101" textAnchor="middle" className="map-label on-node">
        Cloudflare
      </text>

      {/* nginx reverse proxy */}
      <rect x="570" y="146" width="150" height="68" rx="18" className="map-node" />
      <text x="645" y="189" textAnchor="middle" className="map-label on-node">
        Nginx
      </text>

      {/* VPS / Docker */}
      <rect x="220" y="330" width="520" height="290" rx="26" className="map-node map-vps" />
      <text x="480" y="378" textAnchor="middle" className="map-label map-vps-label">
        VPS · Docker
      </text>

      {/* containers */}
      <rect x="272" y="410" width="176" height="88" rx="16" className="map-node map-container" />
      <text x="360" y="462" textAnchor="middle" className="map-label on-node">
        web
      </text>
      <rect x="512" y="410" width="176" height="88" rx="16" className="map-node map-container" />
      <text x="600" y="462" textAnchor="middle" className="map-label on-node">
        api
      </text>
      <rect x="392" y="505" width="176" height="88" rx="16" className="map-node map-container" />
      <text x="480" y="557" textAnchor="middle" className="map-label on-node">
        db
      </text>

      {/* pulses traveling the main route */}
      <circle r="7" className="map-pulse" />
      <circle r="5" className="map-pulse" />
    </svg>
  );
}
