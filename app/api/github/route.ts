import { NextResponse } from "next/server";
import { getGithubSummary } from "@/lib/github";

export async function GET() {
  return NextResponse.json(await getGithubSummary());
}
