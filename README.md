<div align="center">

# plattnericus.dev

**The personal site of Nexor / Plattnericus** — a fullstack developer from South Tyrol, Italy.

[![Live site](https://img.shields.io/badge/live-plattnericus.dev-d97757?style=flat-square)](https://plattnericus.dev)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Three.js](https://img.shields.io/badge/Three.js-R3F-black?style=flat-square&logo=three.js&logoColor=white)](https://docs.pmnd.rs/react-three-fiber)

</div>

---

A single-page, scroll-driven site. Native scroll and Lenis feed one shared
timeline that drives GSAP's `ScrollTrigger` across every section, while an
independently-running React Three Fiber scene reads that same scroll
position to keep a 3D chrome arm and a warp-tunnel starfield in sync with
it — no keyframes against a clock, no state passed between the two layers.

## Highlights

- **One scroll source, two renderers.** The R3F scene re-measures section
  bounds every frame instead of caching them, so it can't drift out of sync
  with a pinned spacer after a layout shift or resize.
- **Reduced motion is a first-class path, not an afterthought.** The canvas
  never mounts, every GSAP timeline is skipped at the source via
  `gsap.matchMedia`, and a small notice — auto-localized into 50 languages
  from the visitor's own browser, no manual switcher — explains why the
  page looks static instead of leaving it unexplained. If the OS setting
  changes while the tab is open, the page reloads to actually reflect it.
- **Built for machines as well as people.** Structured data, `llms.txt` /
  `llms-full.txt`, and `robots.ts` are tuned for both traditional search and
  the current wave of AI answer-engine crawlers (GPTBot, ClaudeBot,
  Google-Extended, and friends).

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| Motion | GSAP 3 + `@gsap/react` + ScrollTrigger, Lenis for smooth scroll |
| 3D | Three.js via React Three Fiber (`@react-three/fiber`, `@react-three/drei`) |

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
```

| Script | Does |
|---|---|
| `npm run dev` | Start the dev server (Turbopack) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | `eslint .` |
| `npm run build` | Production build |
| `npm run check` | typecheck → lint → build, in that order |

## Environment variables

None are required to run the site locally. `.env.example` lists the optional
ones:

| Variable | Purpose |
|---|---|
| `GITHUB-TOKEN` | Raises the GitHub API rate limit for `/api/github` (also reads `GITHUB_TOKEN` or `GH_TOKEN` if set instead). Falls back to unauthenticated requests without it. |
| `GOOGLE_SITE_VERIFICATION` | Fills the Google Search Console verification meta tag in `app/layout.tsx`. |
| `NEXT_PUBLIC_SITE_URL` | Overrides the canonical URL used in metadata, the sitemap, and JSON-LD — useful for preview deployments. Defaults to `https://plattnericus.dev`. |

## Project structure

```
app/
  page.tsx                 section order for the homepage, JSON-LD graph
  layout.tsx                fonts, global metadata
  not-found.tsx              custom 404
  robots.ts, sitemap.ts       SEO surface
  ai/                          plain-text-friendly page for LLM crawlers
  api/github/                   live GitHub repo stats (JSON)
  *-image.tsx, icon.tsx          generated OG/favicon images

components/
  lenis-style/    the page sections — Hero, Why, Showcase, Rethink, Solution, Heat, Footer
  gl/              the R3F canvas + scroll-synced 3D scene
  loader/           intro loader that gates the reveal animations
  providers/         Lenis + ScrollTrigger wiring
  motion/              cursor glow, dynamic favicon, the reduced-motion notice
                        (+ its language table), the 404 page's blob/magnetic button
  clawd/                the desktop mascot
  brand/                 the wordmark

lib/
  animation.ts    shared GSAP/ScrollTrigger setup + easing
  projects.ts      project data shown in Showcase
  site.ts           site identity/config used across metadata
  github.ts          GitHub API client backing /api/github
  clawd.ts, palette.ts   mascot copy, color tokens
```

## Deployment

Deployed on [Vercel](https://vercel.com), auto-deploying from `main`.

---

<div align="center">

Built by [Nexor / Plattnericus](https://github.com/Plattnericus)

</div>
