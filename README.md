# plattnericus.dev

Cinematic developer landing page for **Nexor / Plattnericus** — built like an
Apple product page, not a portfolio template. One long scroll-driven story:
intro reveal, pinned hero, horizontal project showcase, two product case
studies, an animated DevOps pipeline, a cybersecurity radar, tech stack,
future vision and contact.

## Stack

- **Next.js 16** (App Router, React 19, TypeScript strict)
- **GSAP 3.15** — ScrollTrigger, SplitText, DrawSVG, MotionPath, CustomEase, ScrambleText (+ `@gsap/react`)
- **Lenis** smooth scroll, synced to the GSAP ticker
- **Tailwind CSS v4** + custom design system (warm coffee/almond palette, Apple system font stack)
- **lucide-react** icons — no emojis anywhere

All project visuals (device mockups, macOS desktop, system map, pipeline,
radar) are code-rendered CSS/SVG motion graphics — no bitmap screenshots.

## Sections

1. Cinematic intro (`plattnericus.dev` → `Nexor`, max 1.5s)
2. Pinned hero with Build. / Deploy. / Secure. word story, magnetic buttons, mouse-depth, floating elements
3. Statement (blur-to-sharp reveal)
4. Horizontal pinned project showcase — POKYH, StreamDeck, Magic-Mirror, Minesweeper, ProjectilePreview-Mod
5. POKYH product story (pinned devices, screen switching, infrastructure system map)
6. StreamDeck product story (macOS-style desktop, windows open on scroll, typing terminal)
7. DevOps pipeline (GitHub → CI/CD → Docker → VPS → Reverse Proxy → Cloudflare → Live App, DrawSVG + MotionPath packets)
8. Cybersecurity future (radar scan, checklist ticking)
9. Tech stack
10. Future vision (pinned word story)
11. Contact with live GitHub stats

Also: animated canvas favicon (scroll progress ring, tab-switch state),
`prefers-reduced-motion` renders a fully static readable page, mobile turns
pinned/horizontal stories into vertical stacks.

## Live GitHub data

`lib/github.ts` fetches `api.github.com/users/Plattnericus/repos` server-side
(ISR, revalidates hourly) and feeds project slides, the StreamDeck case study
and the contact stats strip. Repos that are not public simply show no stats —
numbers are never invented. `/api/github` exposes the same payload.

Token (optional, avoids rate limits) in `.env`:

```
GITHUB-TOKEN=...   # GITHUB_TOKEN and GH_TOKEN work too
```

## Develop

```
npm run dev     # dev server
npm run check   # typecheck + eslint + production build
```

## SEO / discovery

Metadata + JSON-LD in `app/layout.tsx` / `app/page.tsx`, `robots.ts`,
`sitemap.ts`, OG/Twitter images, `/ai` index page, `public/llms.txt`,
`public/llms-full.txt`, `public/ai.txt`, `public/humans.txt`.
