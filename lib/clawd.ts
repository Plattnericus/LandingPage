/** Clawd's 2D animation clips (GIF renders of the mascot rig) and the
    behavior table for the corner pet. */

export type ClawdClip =
  | "IDLE"
  | "THINKING"
  | "TYPING"
  | "READING_FILES"
  | "RUNNING_COMMAND"
  | "BUILDING"
  | "TESTING"
  | "DEBUGGING"
  | "PERMISSION"
  | "SUBAGENTS"
  | "COMPLETE"
  | "ERROR_RETRY";

/* Bump this whenever the GIF files under public/models/mascot/GIF/ are
   regenerated — same filenames, new pixel content, and browsers otherwise
   keep serving whatever they cached from an earlier version (which is what
   made clips look inconsistently positioned/occasionally-missing: some tabs
   had a mix of old and newly-recentered frames). */
const ASSET_VERSION = "4";

function clip(file: string) {
  return `/models/mascot/GIF/${file}?v=${ASSET_VERSION}`;
}

export const CLAWD_GIF: Record<ClawdClip, string> = {
  IDLE: clip("01_IDLE.gif"),
  THINKING: clip("02_THINKING.gif"),
  TYPING: clip("03_TYPING.gif"),
  READING_FILES: clip("04_READING_FILES.gif"),
  RUNNING_COMMAND: clip("05_RUNNING_COMMAND.gif"),
  BUILDING: clip("06_BUILDING.gif"),
  TESTING: clip("07_TESTING.gif"),
  DEBUGGING: clip("08_DEBUGGING.gif"),
  PERMISSION: clip("09_PERMISSION.gif"),
  SUBAGENTS: clip("10_SUBAGENTS.gif"),
  COMPLETE: clip("11_COMPLETE.gif"),
  ERROR_RETRY: clip("12_ERROR_RETRY.gif"),
};

/** Clips Clawd drifts into on his own while nothing is happening. */
export const IDLE_FLAVOR: ClawdClip[] = ["THINKING", "RUNNING_COMMAND"];

/** Pool Clawd picks a random clip from while the user is scrolling fast. */
export const SCROLL_CLIPS: ClawdClip[] = [
  "TYPING",
  "READING_FILES",
  "RUNNING_COMMAND",
  "BUILDING",
  "TESTING",
  "DEBUGGING",
  "SUBAGENTS",
];

/** Clips for a click reaction, with a matching line for the speech bubble. */
export const CLICK_REACTIONS: Array<{ clip: ClawdClip; line: string }> = [
  { clip: "PERMISSION", line: "May I?" },
  { clip: "DEBUGGING", line: "Found the bug. It was me." },
  { clip: "SUBAGENTS", line: "Delegating this click…" },
  { clip: "ERROR_RETRY", line: "Retrying…" },
];

/** Section class → clip Clawd reacts with while that section is on screen. */
export const SECTION_CLIPS: Array<{ selector: string; clip: ClawdClip }> = [
  { selector: ".showcase", clip: "READING_FILES" },
  { selector: ".heat", clip: "BUILDING" },
  { selector: ".footer-giant", clip: "COMPLETE" },
];
