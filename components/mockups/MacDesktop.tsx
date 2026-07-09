import { AppWindow, FolderClosed, Globe, Settings, TerminalSquare } from "lucide-react";

/** macOS-style desktop rendered in code; windows open and the terminal types via GSAP. */
export default function MacDesktop() {
  return (
    <div className="macdesk">
      <div className="macdesk-wall" data-depth="8" aria-hidden="true" />

      <div className="macdesk-menubar mono">
        <span className="macdesk-brand">StreamDeck</span>
        <span className="macdesk-clock">09:41</span>
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
            <span className="term-cmd" />
            <span className="term-caret" aria-hidden="true" />
          </p>
          <p className="term-line term-out" />
        </div>
      </div>

      <div className="macdesk-dock" data-depth="12" aria-hidden="true">
        <span className="dock-icon">
          <FolderClosed />
        </span>
        <span className="dock-icon">
          <Globe />
        </span>
        <span className="dock-icon">
          <TerminalSquare />
        </span>
        <span className="dock-icon">
          <AppWindow />
        </span>
        <span className="dock-icon">
          <Settings />
        </span>
      </div>
    </div>
  );
}
