# plattnericus.dev

**Live at [plattnericus.dev](https://plattnericus.dev)**

Personal portfolio site for Nexor / Plattnericus — a fullstack developer from
South Tyrol. Single-page, scroll-driven site built on Next.js, with a GSAP +
Lenis animation layer and a React Three Fiber scene running behind the
content.

## Highlights

- One continuous scroll timeline: Lenis drives native scroll, GSAP's
  `ScrollTrigger` drives every reveal, and the R3F scene reads the same
  scroll position independently — nothing is keyframed against a clock.
- The 3D scene (a chrome arm/hand, a warp-tunnel starfield) re-measures
  section bounds every frame instead of caching them, so it can't drift out
  of sync after a layout shift or a resize.
- Fully usable with `prefers-reduced-motion` on: the canvas never mounts,
  every GSAP timeline is skipped at the source via `gsap.matchMedia`, and a
  one-time notice (auto-localized to the visitor's own language, no manual
  switcher) explains why the page looks static instead of just leaving it
  unexplained.
- Structured data, `llms.txt`/`llms-full.txt`, and `robots.ts` are tuned for
  both traditional search and the current wave of AI answer-engine crawlers.

## Stack

- **Next.js 16** (App Router) · **React 19** · **TypeScript** (strict)
- **Tailwind CSS v4**
- **GSAP 3** + `@gsap/react` + ScrollTrigger, **Lenis** for smooth scroll
- **Three.js** via **React Three Fiber** (`@react-three/fiber`, `@react-three/drei`) for the 3D scene

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
```

Other scripts:

```bash
npm run typecheck  # tsc --noEmit
npm run lint       # eslint .
npm run build      # production build
npm run check      # typecheck + lint + build, in that order
```

## Environment variables

None are required to run the site locally. `.env.example` lists the optional
ones:

| Variable | Purpose |
|---|---|
| `GITHUB-TOKEN` | Raises the GitHub API rate limit for `/api/github` (also reads `GITHUB_TOKEN` or `GH_TOKEN` if set instead). Falls back to unauthenticated requests without it. |
| `GOOGLE_SITE_VERIFICATION` | Fills the Google Search Console verification meta tag in `app/layout.tsx`. |

`NEXT_PUBLIC_SITE_URL` is also read (in `lib/site.ts`) if you need to point
canonical URLs, the sitemap, and JSON-LD at something other than
`https://plattnericus.dev` — useful for preview deployments.

## Project structure

```
app/
  page.tsx            section order for the homepage, JSON-LD graph
  layout.tsx           fonts, global metadata
  robots.ts, sitemap.ts   SEO surface
  ai/                   a plain-text-friendly page for LLM crawlers
  api/github/           live GitHub repo stats (JSON)
  *-image.tsx, icon.tsx   generated OG/favicon images

components/
  lenis-style/          the actual page sections (Hero, Why, Showcase, Rethink, Solution, Heat, Footer)
  gl/                    the React Three Fiber canvas + scroll-synced 3D scene
  loader/                intro loader that gates the reveal animations
  providers/             Lenis + ScrollTrigger wiring, the dynamic favicon
  motion/                shared motion primitives (cursor glow, reduced-motion notice, the 404 page's blob/magnetic-button)
  clawd/                  the desktop mascot
  brand/                  the wordmark

lib/
  animation.ts           shared GSAP/ScrollTrigger setup + easing
  projects.ts             project data shown in Showcase
  site.ts                  site identity/config used across metadata
  github.ts                GitHub API client backing /api/github
  clawd.ts, palette.ts     mascot copy, color tokens
```

## The animation system, briefly

Scroll position drives almost everything. `SmoothScrollProvider` wires Lenis
into the GSAP ticker so native scroll and GSAP's `ScrollTrigger` stay in
sync. Each section in `components/lenis-style/` owns its own
`ScrollTrigger`-based timeline, scoped with `useGSAP`. The 3D scene in
`components/gl/GLCanvas.tsx` runs independently on the same scroll position —
it re-measures section bounds every frame rather than relying on React state,
so it can't drift out of sync with a pinned spacer after a layout shift.

Everything animated is gated behind `prefers-reduced-motion`. When it's set,
the 3D canvas never mounts, GSAP timelines are skipped via `gsap.matchMedia`,
and `ReducedMotionNotice` shows a one-time, dismissible explanation of why
the page looks static instead of silently rendering a degraded version with
no context.

## Deployment

Deployed on Vercel, auto-deploying from `main`.
