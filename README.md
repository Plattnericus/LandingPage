# plattnericus.dev Landing Page

Premium Next.js landing page for Nexor / Plattnericus.

This is not a generic portfolio template. The page is built as a cinematic developer product page with real project screenshots, GSAP-driven motion graphics, strong SEO, AI-discovery files and a live GitHub signal at the end.

## Current Build

- Framework: Next.js 16
- Language: TypeScript
- Styling: Tailwind CSS v4 entry plus custom global CSS
- Motion: GSAP, ScrollTrigger and Lenis
- Icons: lucide-react
- Images: real live-site screenshots, upscaled to 8K WebP
- SEO: Next Metadata API, JSON-LD, Open Graph image, Twitter image, robots.txt and sitemap.xml
- AI discovery: `llms.txt`
- GitHub data: `/api/github` route with token fallback support

## Live Project Screenshots

The showcase uses real screenshots from deployed projects:

- ThreeJS Portfolio: `https://threejs.plattnericus.dev/`
- StreamDeck Desktop: `https://streamdeck.plattnericus.dev/desktop`
- Finanzen: `http://finanzen.plattnericus.dev/`
- CampedellApp: `https://campedell-app.vercel.app`

Raw screenshots live in:

```txt
public/project-shots/
```

8K upscaled versions live in:

```txt
public/project-shots/8k/
```

Upscaling is handled by:

```bash
npm run upscale-shots
```

The script upscales every screenshot to 7680px width, writes WebP output and compares the result against the original after downscaling. It fails if the visual drift is too high.

## SEO

Implemented SEO surfaces:

- Google Lighthouse SEO score: `100`
- Google Search Console verification support through `GOOGLE_SITE_VERIFICATION`
- static `metadata` in `app/layout.tsx`
- canonical URL for `https://plattnericus.dev`
- self-referencing `hreflang` and `x-default`
- Open Graph metadata
- Twitter card metadata
- generated static `/opengraph-image`
- generated static `/twitter-image`
- generated static `/icon`
- generated static `/apple-icon`
- JSON-LD graph for Person, WebSite and ProfilePage
- generated `/robots.txt`
- generated `/sitemap.xml`
- public `/llms.txt`
- public `/humans.txt`
- `site.webmanifest`

The robots file allows general search crawlers and known AI/search crawlers, then points to the sitemap.

## GitHub API

The landing page includes a final live GitHub section powered by:

```txt
app/api/github/route.ts
```

The route reads a token from one of these environment keys:

```txt
GITHUB-TOKEN
GITHUB_TOKEN
GH_TOKEN
```

It only returns sanitized public repository data. If the token is missing or invalid, it falls back to unauthenticated public GitHub API access.

## Google Search Console

Optional Search Console verification is supported through:

```txt
GOOGLE_SITE_VERIFICATION=your_google_search_console_verification_token
```

When this value is present at build time, Next.js emits the Google verification meta tag automatically.

## Development

Install dependencies:

```bash
npm install
```

Run locally:

```bash
npm run dev
```

Build:

```bash
npm run build
```

Full check:

```bash
npm run check
```

Audit dependencies:

```bash
npm audit
```

## Important Commands

```bash
npm run typecheck
npm run lint
npm run build
npm run check
npm run upscale-shots
```

## Visual Direction

The site should feel:

- premium
- technical
- calm
- cinematic
- real
- product-like

It should not feel like:

- a generic Tailwind template
- a normal card-grid portfolio
- a fake hacker page
- a SaaS landing page
- an icon wall
- an AI-generated placeholder design

## Definition of Done

The page is in good shape when:

- all project slides use real screenshots
- project slides click directly to the live project
- StreamDeck opens `https://streamdeck.plattnericus.dev/desktop`
- GSAP motion works without console errors
- reduced-motion users get a stable experience
- `/robots.txt` and `/sitemap.xml` work
- `/llms.txt` works
- GitHub data loads through `/api/github`
- `npm run check` passes
- `npm audit` reports 0 vulnerabilities
- Chrome visual checks confirm no broken layout or empty images
