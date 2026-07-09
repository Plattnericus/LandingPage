import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

const searchCrawlers = [
  "Googlebot",
  "Googlebot-Image",
  "Googlebot-Video",
  "Googlebot-News",
  "Bingbot",
  "BingPreview",
  "msnbot",
  "MSNBot-Media",
  "DuckDuckBot",
  "Applebot",
  "YandexBot",
  "Baiduspider",
  "Slurp",
  "Sogou",
  "Sogou spider",
  "SeznamBot",
  "PetalBot",
  "Bravebot",
];

const googleAiCrawlers = [
  "Google-Extended",
  "GoogleOther",
  "GoogleOther-Image",
  "GoogleOther-Video",
  "Google-CloudVertexBot",
  "Google-NotebookLM",
  "Gemini-Deep-Research",
  "Applebot-Extended",
];

const aiCrawlers = [
  "OAI-SearchBot",
  "ChatGPT-User",
  "GPTBot",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "Claude-Web",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "DeepSeekBot",
  "DeepSeek-Crawler",
  "CCBot",
  "FacebookBot",
  "Meta-ExternalAgent",
  "Amazonbot",
  "Bytespider",
  "YouBot",
  "KimiBot",
  "MoonshotBot",
  "Qwen",
  "QwenBot",
  "ZhipuBot",
  "xAI",
  "Grok",
  "GrokAI",
];

const socialPreviewCrawlers = [
  "Twitterbot",
  "LinkedInBot",
  "Slackbot-LinkExpanding",
  "Discordbot",
  "WhatsApp",
  "TelegramBot",
  "facebookexternalhit",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: searchCrawlers,
        allow: "/",
      },
      {
        userAgent: googleAiCrawlers,
        allow: "/",
      },
      {
        userAgent: aiCrawlers,
        allow: "/",
      },
      {
        userAgent: socialPreviewCrawlers,
        allow: "/",
      },
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}
