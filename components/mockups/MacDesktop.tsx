import {
  AppWindow,
  BatteryMedium,
  FolderClosed,
  Globe,
  Music,
  Rocket,
  Search,
  Settings,
  TerminalSquare,
  Wifi,
} from "lucide-react";

/** macOS-style desktop rendered in code; the pinned GSAP timeline in
    StreamDeckStory drives cursor, windows, spotlight, terminal and dock. */
export default function MacDesktop() {
  return (
    <div className="macdesk">
      <div className="macdesk-wall" data-depth="8" aria-hidden="true" />

      <div className="macdesk-menubar mono">
        <span className="menu-left">
          <span className="macdesk-brand">StreamDeck</span>
          {["File", "Edit", "View", "Go", "Window"].map((item) => (
            <span key={item} className="menu-item">
              {item}
            </span>
          ))}
        </span>
        <span className="menu-right">
          <Wifi className="menu-glyph" aria-hidden="true" />
          <BatteryMedium className="menu-glyph" aria-hidden="true" />
          <span className="macdesk-clock">09:41</span>
        </span>
      </div>

      <div className="macdesk-window win-files" data-depth="16">
        <div className="win-bar">
          <span className="pv-traffic" />
          <span className="pv-traffic" />
          <span className="pv-traffic" />
          <span className="win-title">Files</span>
        </div>
        <div className="win-body">
          <span className="win-row pv-line w80" />
          <span className="win-row pv-line w60" />
          <span className="win-row pv-line w70" />
          <span className="win-row pv-line w50" />
        </div>
      </div>

      <div className="macdesk-window win-preview" data-depth="20">
        <div className="win-bar">
          <span className="pv-traffic" />
          <span className="pv-traffic" />
          <span className="pv-traffic" />
          <span className="win-title">Preview — streamdeck.app</span>
        </div>
        <div className="win-body win-preview-body">
          <span className="pv-nav" />
          <span className="pv-heroblock" />
          <div className="pv-cards">
            <span className="pv-card" />
            <span className="pv-card" />
            <span className="pv-card" />
          </div>
        </div>
      </div>

      <div className="macdesk-window win-tools" data-depth="24">
        <div className="win-bar">
          <span className="pv-traffic" />
          <span className="pv-traffic" />
          <span className="pv-traffic" />
          <span className="win-title">Tools</span>
        </div>
        <div className="win-body win-tools-grid">
          <span className="tool-tile" />
          <span className="tool-tile is-accent" />
          <span className="tool-tile" />
          <span className="tool-tile" />
        </div>
      </div>

      <div className="macdesk-window win-terminal" data-depth="30">
        <div className="win-bar">
          <span className="pv-traffic" />
          <span className="pv-traffic" />
          <span className="pv-traffic" />
          <span className="win-title">Terminal</span>
        </div>
        <div className="win-body mono">
          <p className="term-line">
            <span className="term-prompt">$ </span>
            <span className="term-cmd term-cmd-1" />
            <span className="term-caret term-caret-1" aria-hidden="true" />
          </p>
          <p className="term-line term-out term-out-1" />
          <p className="term-line term-line-2">
            <span className="term-prompt">$ </span>
            <span className="term-cmd term-cmd-2" />
            <span className="term-caret term-caret-2" aria-hidden="true" />
          </p>
          <p className="term-line term-out term-out-2" />
        </div>
      </div>

      <div className="macdesk-window win-music" data-depth="14">
        <div className="win-body">
          <span className="music-art">
            <Music aria-hidden="true" />
          </span>
          <span className="music-meta">
            <span className="pv-line w70" />
            <span className="pv-line w50" />
          </span>
          <span className="music-eq" aria-hidden="true">
            <span className="eq-bar" />
            <span className="eq-bar" />
            <span className="eq-bar" />
            <span className="eq-bar" />
            <span className="eq-bar" />
          </span>
        </div>
        <span className="music-progress" aria-hidden="true">
          <span className="music-progress-fill" />
        </span>
      </div>

      <div className="macdesk-spotlight mono" aria-hidden="true">
        <Search className="spot-icon" aria-hidden="true" />
        <span className="spot-text" />
        <span className="term-caret spot-caret" />
      </div>

      <div className="macdesk-notif" aria-hidden="true">
        <span className="notif-icon">
          <Rocket aria-hidden="true" />
        </span>
        <span className="notif-copy">
          <span className="notif-title">Deploy complete</span>
          <span className="notif-sub">streamdeck.plattnericus.dev is live</span>
        </span>
      </div>

      <div className="macdesk-dock" data-depth="12" aria-hidden="true">
        <span className="dock-icon dock-files">
          <FolderClosed />
        </span>
        <span className="dock-icon dock-globe">
          <Globe />
        </span>
        <span className="dock-icon dock-term">
          <TerminalSquare />
          <span className="dock-dot" />
        </span>
        <span className="dock-icon">
          <AppWindow />
        </span>
        <span className="dock-icon dock-music">
          <Music />
        </span>
        <span className="dock-icon">
          <Settings />
        </span>
      </div>

      <div className="mac-cursor" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M4 2 L4 18.5 L8.2 14.6 L10.6 20.2 L13.4 19 L11 13.5 L16.8 13.2 Z" />
        </svg>
        <span className="cursor-ring" />
      </div>
    </div>
  );
}
