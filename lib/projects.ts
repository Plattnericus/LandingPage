export type ProjectVisualId =
  | "pokyh"
  | "threejs"
  | "streamdeck"
  | "magic-mirror"
  | "minesweeper"
  | "projectile";

export type Project = {
  name: string;
  slug: string;
  /** GitHub repository name used to match live API data (may not be public yet). */
  repoName: string;
  eyebrow: string;
  description: string;
  tech: string[];
  liveUrl: string | null;
  githubUrl: string | null;
  visual: ProjectVisualId;
};

export const projects: Project[] = [
  {
    name: "POKYH",
    slug: "pokyh",
    repoName: "POKYH",
    eyebrow: "School platform",
    description:
      "A school-focused platform built around real student workflows: timetable, grades, absences, messages, mobile app, backend, APIs and deployment.",
    tech: ["Next.js", "TypeScript", "API", "Docker", "Cloudflare"],
    liveUrl: "https://pokyh.com",
    githubUrl: "https://github.com/Plattnericus",
    visual: "pokyh",
  },
  {
    name: "ThreeJS Portfolio",
    slug: "threejs-portfolio",
    repoName: "ThreeJS_Portfolio",
    eyebrow: "3D web experience",
    description:
      "An immersive 3D portfolio rendered in the browser: WebGL scenes, camera choreography and real-time lighting built with Three.js.",
    tech: ["Three.js", "WebGL", "GLSL", "JavaScript"],
    liveUrl: "https://threejs.plattnericus.dev",
    githubUrl: "https://github.com/Plattnericus/ThreeJS_Portfolio",
    visual: "threejs",
  },
  {
    name: "StreamDeck",
    slug: "streamdeck",
    repoName: "StreamDeck",
    eyebrow: "Browser desktop",
    description:
      "An interactive web desktop with app-like windows, tools and a polished browser-based experience.",
    tech: ["React", "JavaScript", "Desktop UI", "Motion"],
    liveUrl: "https://streamdeck.plattnericus.dev/desktop",
    githubUrl: "https://github.com/Plattnericus/StreamDeck",
    visual: "streamdeck",
  },
  {
    name: "Magic-Mirror",
    slug: "magic-mirror",
    repoName: "Magic-Mirror",
    eyebrow: "Selfhosted smart display",
    description:
      "A wall-mounted smart display running on a Raspberry Pi: time, weather and daily information rendered as a calm always-on interface.",
    tech: ["JavaScript", "Node.js", "Raspberry Pi", "Selfhosting"],
    liveUrl: null,
    githubUrl: "https://github.com/Plattnericus",
    visual: "magic-mirror",
  },
  {
    name: "Minesweeper",
    slug: "minesweeper",
    repoName: "Minesweeper",
    eyebrow: "Classic rebuilt",
    description:
      "The classic logic game rebuilt from scratch: clean grid state, flood reveals, flagging and a focused minimal interface.",
    tech: ["Game Logic", "Grid Algorithms", "UI"],
    liveUrl: null,
    githubUrl: "https://github.com/Plattnericus",
    visual: "minesweeper",
  },
  {
    name: "ProjectilePreview-Mod",
    slug: "projectilepreview-mod",
    repoName: "ProjectilePreview-Mod",
    eyebrow: "Minecraft mod",
    description:
      "A game mod that renders the predicted flight path of projectiles in real time, directly inside the game world.",
    tech: ["Java", "Modding", "Physics"],
    liveUrl: "https://modrinth.com/mod/projectile.preview",
    githubUrl: "https://github.com/Plattnericus",
    visual: "projectile",
  },
];
