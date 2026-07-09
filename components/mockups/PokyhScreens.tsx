/** CSS/SVG-rendered POKYH app screens, stacked and crossfaded by GSAP.
    Deliberately recognizable: macOS chrome, labeled navigation, real rows. */

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const PERIODS = [
  ["Math", "CS", "Eng", "Bio", "CS"],
  ["Ger", "Math", "Lab", "It", "Eth"],
  ["CS", "Net", "Ger", "Math", "Gym"],
  ["Hist", "Eng", "CS", "Lab", "—"],
];
const PERIOD_ACCENTS = new Set(["CS", "Net", "Lab"]);

const NAV_ITEMS = [
  { label: "Dashboard", active: false },
  { label: "Timetable", active: true },
  { label: "Grades", active: false },
  { label: "Absences", active: false },
  { label: "Messages", active: false },
  { label: "Security", active: false },
];

function MacChrome({ title }: { title: string }) {
  return (
    <div className="pokyh-chrome">
      <span className="pv-traffic" />
      <span className="pv-traffic" />
      <span className="pv-traffic" />
      <span className="pokyh-chrome-title">{title}</span>
      <span className="pokyh-chrome-clock mono">09:41</span>
    </div>
  );
}

export function PokyhMacScreens() {
  return (
    <>
      <div className="pokyh-screen" data-screen="idea">
        <MacChrome title="POKYH — Concept" />
        <div className="pokyh-idea">
          <svg viewBox="0 0 520 280" fill="none" aria-hidden="true">
            <rect x="14" y="14" width="492" height="38" rx="8" className="wire-path" />
            <rect x="14" y="68" width="140" height="198" rx="8" className="wire-path" />
            <rect x="172" y="68" width="334" height="112" rx="8" className="wire-path" />
            <rect x="172" y="196" width="158" height="70" rx="8" className="wire-path" />
            <rect x="348" y="196" width="158" height="70" rx="8" className="wire-path" />
            <line x1="34" y1="94" x2="134" y2="94" className="wire-path thin" />
            <line x1="34" y1="118" x2="114" y2="118" className="wire-path thin" />
            <line x1="34" y1="142" x2="128" y2="142" className="wire-path thin" />
          </svg>
          <p className="pokyh-idea-note mono">idea → wireframe → school platform</p>
        </div>
      </div>

      <div className="pokyh-screen" data-screen="interface">
        <MacChrome title="POKYH — Timetable" />
        <div className="pokyh-app">
          <nav className="pokyh-app-side" aria-hidden="true">
            <p className="pokyh-app-logo">POKYH</p>
            {NAV_ITEMS.map((item) => (
              <span key={item.label} className={`pokyh-nav ${item.active ? "is-active" : ""}`}>
                <i className="pokyh-nav-dot" />
                {item.label}
              </span>
            ))}
          </nav>
          <div className="pokyh-app-main">
            <div className="pokyh-app-header">
              <span className="pokyh-app-title">Week 28</span>
              <span className="pokyh-pill">Timetable</span>
            </div>
            <div className="pokyh-days">
              {WEEKDAYS.map((day) => (
                <span key={day} className="pokyh-day mono">
                  {day}
                </span>
              ))}
            </div>
            <div className="pokyh-timetable">
              {PERIODS.flat().map((subject, i) => (
                <span
                  key={i}
                  className={`pokyh-period ${PERIOD_ACCENTS.has(subject) ? "is-accent" : ""}`}
                >
                  {subject}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="pokyh-screen" data-screen="api">
        <MacChrome title="POKYH — API" />
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
            <span className="tok-key">&quot;auth&quot;</span>: <span className="tok-val">&quot;bearer · rate-limit ok&quot;</span>
          </p>
          <p className="tok-dim">{"}"}</p>
          <p className="tok-status">200 OK · 38ms</p>
        </div>
      </div>

      <div className="pokyh-screen" data-screen="deploy">
        <MacChrome title="POKYH — Deploy" />
        <div className="pokyh-code mono">
          <p>
            <span className="tok-key">$</span> docker compose up -d
          </p>
          <p className="tok-dim">pokyh-web ......... running</p>
          <p className="tok-dim">pokyh-api ......... running</p>
          <p className="tok-dim">pokyh-db .......... healthy</p>
          <p>
            <span className="tok-key">$</span> ufw status · tls strict
          </p>
          <p className="tok-status">live at pokyh.plattnericus.dev</p>
        </div>
      </div>
    </>
  );
}

const MESSAGES = [
  { name: "Class 4B", preview: "Timetable changed for Friday", unread: true },
  { name: "Mensa", preview: "Menu: pizza day", unread: false },
  { name: "Admin", preview: "Grades are online now", unread: true },
  { name: "Study group", preview: "Meet at 14:00?", unread: false },
];

export function PokyhPhoneScreen() {
  return (
    <div className="pokyh-phone-screen">
      <div className="pokyh-status mono" aria-hidden="true">
        <span>09:41</span>
        <span className="pokyh-status-icons">
          <i className="ps-signal" />
          <i className="ps-wifi" />
          <i className="ps-battery" />
        </span>
      </div>
      <p className="pokyh-phone-title">Messages</p>
      <span className="pokyh-search" aria-hidden="true">
        Search
      </span>
      {MESSAGES.map((message) => (
        <div key={message.name} className={`pokyh-msg ${message.unread ? "is-accent" : ""}`}>
          <span className="pokyh-avatar">{message.name.charAt(0)}</span>
          <span className="pokyh-msg-body">
            <span className="pokyh-msg-name">{message.name}</span>
            <span className="pokyh-msg-preview">{message.preview}</span>
          </span>
          {message.unread ? <i className="pokyh-unread" aria-hidden="true" /> : null}
        </div>
      ))}
    </div>
  );
}
