/** CSS/SVG-rendered POKYH app screens, stacked and crossfaded by GSAP. */

const TIMETABLE_ACCENTS = new Set([1, 7, 10, 14, 18]);

export function PokyhMacScreens() {
  return (
    <>
      <div className="pokyh-screen" data-screen="idea">
        <svg viewBox="0 0 520 320" fill="none" aria-hidden="true">
          <rect x="18" y="18" width="484" height="44" rx="8" className="wire-path" />
          <rect x="18" y="80" width="150" height="222" rx="8" className="wire-path" />
          <rect x="186" y="80" width="316" height="130" rx="8" className="wire-path" />
          <rect x="186" y="228" width="150" height="74" rx="8" className="wire-path" />
          <rect x="352" y="228" width="150" height="74" rx="8" className="wire-path" />
          <line x1="40" y1="104" x2="146" y2="104" className="wire-path thin" />
          <line x1="40" y1="128" x2="126" y2="128" className="wire-path thin" />
          <line x1="40" y1="152" x2="140" y2="152" className="wire-path thin" />
        </svg>
      </div>

      <div className="pokyh-screen" data-screen="interface">
        <div className="pokyh-app">
          <div className="pokyh-app-side">
            <span className="pv-dot" />
            <span className="pv-line w80" />
            <span className="pv-line w60" />
            <span className="pv-line w70" />
            <span className="pv-line w50" />
          </div>
          <div className="pokyh-app-main">
            <div className="pokyh-app-header">
              <span className="pv-line w30" />
              <span className="pokyh-pill">Timetable</span>
            </div>
            <div className="pokyh-timetable">
              {Array.from({ length: 20 }, (_, i) => (
                <span
                  key={i}
                  className={`pokyh-period ${TIMETABLE_ACCENTS.has(i) ? "is-accent" : ""}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="pokyh-screen" data-screen="api">
        <div className="pokyh-code mono">
          <p>
            <span className="tok-key">GET</span> /api/v1/timetable
          </p>
          <p className="tok-dim">{"{"}</p>
          <p>
            <span className="tok-key">&quot;student&quot;</span>: <span className="tok-val">&quot;nexor&quot;</span>,
          </p>
          <p>
            <span className="tok-key">&quot;week&quot;</span>: <span className="tok-val">28</span>,
          </p>
          <p>
            <span className="tok-key">&quot;periods&quot;</span>: [ <span className="tok-dim">…</span> ],
          </p>
          <p>
            <span className="tok-key">&quot;auth&quot;</span>: <span className="tok-val">&quot;bearer&quot;</span>
          </p>
          <p className="tok-dim">{"}"}</p>
          <p className="tok-status">200 OK · 38ms</p>
        </div>
      </div>

      <div className="pokyh-screen" data-screen="deploy">
        <div className="pokyh-code mono">
          <p>
            <span className="tok-key">$</span> docker compose up -d
          </p>
          <p className="tok-dim">pokyh-web ......... running</p>
          <p className="tok-dim">pokyh-api ......... running</p>
          <p className="tok-dim">pokyh-db .......... healthy</p>
          <p>
            <span className="tok-key">$</span> cloudflared tunnel run
          </p>
          <p className="tok-status">live at pokyh.plattnericus.dev</p>
        </div>
      </div>
    </>
  );
}

export function PokyhPhoneScreen() {
  return (
    <div className="pokyh-phone-screen">
      <p className="pokyh-phone-title">Messages</p>
      <div className="pokyh-msg">
        <span className="pokyh-avatar" />
        <span className="pv-line w70" />
      </div>
      <div className="pokyh-msg">
        <span className="pokyh-avatar" />
        <span className="pv-line w50" />
      </div>
      <div className="pokyh-msg is-accent">
        <span className="pokyh-avatar" />
        <span className="pv-line w60" />
      </div>
      <div className="pokyh-msg">
        <span className="pokyh-avatar" />
        <span className="pv-line w80" />
      </div>
    </div>
  );
}
