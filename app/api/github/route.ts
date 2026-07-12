import { NextResponse } from "next/server";
import { getGithubSummary } from "@/lib/github";

/* The underlying fetch is cached for an hour (Next data cache), so GitHub is
   contacted at most ~once per hour no matter how often this route is hit;
   the response itself is CDN-cacheable too. The token never leaves the server. */
export const revalidate = 3600;

export async function GET() {
  const summary = await getGithubSummary();
  return NextResponse.json(summary, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      /* Raw data endpoint, not a page — keep it out of search and AI indexes. */
      "X-Robots-Tag": "noindex",
    },
  });
}
