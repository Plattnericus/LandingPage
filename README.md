# plattnericus.dev

> Build. Deploy. Secure.

The cinematic landing page of **Nexor / Plattnericus** ([github.com/Plattnericus](https://github.com/Plattnericus)) —
a fullstack developer from South Tyrol heading toward DevOps and cybersecurity.
Designed like an Apple product page, animated like a GSAP showcase piece:
one continuous scroll story with pinned scenes, liquid morphing shapes,
code-rendered device mockups and live GitHub data. Not a template.

---

## Experience

| # | Scene | Signature motion |
|---|-------|------------------|
| 00 | Cinematic intro | Wordmark out of blur over a morphing liquid blob, ≤ 1.5 s |
| 01 | Pinned hero | SplitText 3D char entrance, magnetic CTAs, mouse spotlight + depth, floating orbit elements, rotating halo, Build. → Deploy. → Secure. word story |
| 02 | Statement | Blur-to-sharp headline, word-by-word text brighten on scrub |
| 03 | Project orbit | Semicircular wheel on the left — five projects rotate through the apex with snap stepping, copy panels swap with SplitText, per-visual micro-motion on the active card |
| 04 | POKYH case study | Pinned MacBook + iPhone, screens switch per story beat, infrastructure lines draw into a full system map with traveling pulses |
| 05 | StreamDeck case study | macOS-style desktop in a browser frame: windows spring open, dock icons pop, terminal types live, everything reacts to the mouse |
| 06 | DevOps lab | GitHub → CI/CD → Docker → VPS → Reverse Proxy → Cloudflare → Live App: DrawSVG pipeline, MotionPath packets, glowing hand-off |
| 07 | Cybersecurity | Radar sweep, blips, a checklist that ticks itself while you scroll |
| 08 | Tech stack | Staggered category rows with differential scroll drift |
| 09 | Future vision | Pinned giant-word story: Fullstack → Infrastructure → Automation → Security |
| 10 | Contact | Live GitHub stats counting up, breathing primary CTA, liquid accent |

Extras: a **living browser tab** (canvas favicon with scroll progress ring —
glyph and page title change per section, dim + notification dot when the tab
is hidden, ring spin on return) and a fully animated **404 page** in the same
design language.

## Stack

- **Next.js 16** — App Router, React 19, TypeScript strict
- **GSAP 3.15** — ScrollTrigger, SplitText, DrawSVG, MotionPath, **MorphSVG** (liquid blobs), CustomEase, ScrambleText, TextPlugin via `@gsap/react`
- **Lenis** — smooth scroll driven by the GSAP ticker
- **Tailwind CSS v4** + a hand-built design system: warm coffee/almond palette, Apple system font stack (`-apple-system, "SF Pro Display", …`)
- **lucide-react** — every icon is an SVG, zero emojis

All device mockups (MacBook, iPhone, browser, smart mirror, minesweeper
board, trajectory scene, system map, pipeline, radar) are **code-rendered
CSS/SVG** — no bitmap screenshots anywhere.

## Live GitHub data

`lib/github.ts` fetches `api.github.com/users/Plattnericus/repos` on the
server (ISR, revalidated hourly) and feeds the orbit panels, the StreamDeck
case study and the contact stats strip. Projects without a public repository
simply show no numbers — stats are never invented. The same payload is
exposed at `/api/github`.

```bash
# .env — optional token to avoid rate limits
GITHUB-TOKEN=ghp_...        # GITHUB_TOKEN / GH_TOKEN also work
```

## Development

```bash
npm install
npm run dev      # http://localhost:3000
npm run check    # typecheck + eslint + production build
```

## Project structure

```
app/                  routes, SEO surface (robots, sitemap, OG images, /ai), 404
components/
  providers/          Lenis + ScrollTrigger orchestration
  motion/             MagneticButton, AnimatedHeadline, LiquidBlob,
                      DynamicFavicon, ScrollProgress, AmbientBackground, useDepth
  sections/           one component per scene
  mockups/            code-rendered devices & diagrams
lib/                  animation setup, GitHub client, content, project data
```

## Accessibility & performance

`prefers-reduced-motion` renders a fully static, complete page (pins,
loops, liquid and intro are simply gone). Mobile swaps pinned/orbital scenes
for vertical stacks. Infinite animations are gated to the viewport and pause
in hidden tabs; blur effects are budgeted; scrubbed timelines restore their
exact resting state when you scroll back up.
