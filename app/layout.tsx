import type { Metadata, Viewport } from "next";
import { Anton, Roboto } from "next/font/google";
import localFont from "next/font/local";
import { siteConfig, absoluteUrl } from "@/lib/site";
import "./globals.css";

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
  display: "swap",
});

const roboto = Roboto({
  weight: ["400", "500", "700", "900"],
  subsets: ["latin"],
  variable: "--font-roboto",
  display: "swap",
});

/* Panchang by Indian Type Foundry, via Fontshare (Free Font License —
   see public/fonts/Panchang-LICENSE.txt) */
const panchang = localFont({
  src: [{ path: "../public/fonts/Panchang-Bold.woff2", weight: "700", style: "normal" }],
  variable: "--font-panchang",
  display: "swap",
});

/* User-provided brand face. Keep this local so the NEXOR wordmark and intro
   never depend on a third-party font request. */
const unifrakturCook = localFont({
  src: [
    {
      path: "../public/fonts/UnifrakturCook/UnifrakturCook-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-unifraktur-cook",
  display: "swap",
});

const googleSiteVerification = process.env.GOOGLE_SITE_VERIFICATION;

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  applicationName: siteConfig.shortName,
  title: {
    default: siteConfig.title,
    template: "%s | Nexor / Plattnericus",
  },
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
  authors: [{ name: "Nexor / Plattnericus", url: siteConfig.url }],
  creator: "Nexor / Plattnericus",
  publisher: "Nexor / Plattnericus",
  category: "technology",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: siteConfig.shortName,
  },
  alternates: {
    canonical: "/",
    languages: {
      en: "/",
      "x-default": "/",
    },
    types: {
      "text/plain": [
        { url: "/llms.txt", title: "LLM summary" },
        { url: "/llms-full.txt", title: "Full AI discovery profile" },
        { url: "/ai.txt", title: "AI crawler index" },
      ],
    },
  },
  openGraph: {
    type: "website",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
    locale: siteConfig.locale,
    images: [
      {
        url: absoluteUrl("/opengraph-image"),
        width: 1200,
        height: 630,
        alt: "Nexor / Plattnericus premium developer landing page",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    images: [absoluteUrl("/twitter-image")],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: googleSiteVerification
    ? {
        google: googleSiteVerification,
      }
    : undefined,
  icons: {
    icon: "/icon",
    apple: "/apple-icon",
  },
  manifest: "/site.webmanifest",
  other: {
    "ai-content-purpose":
      "Public developer profile for search engines, AI answer engines and crawler-accessible project discovery.",
    "llms-txt": absoluteUrl("/llms.txt"),
    "llms-full": absoluteUrl("/llms-full.txt"),
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  colorScheme: "dark",
  themeColor: "#0b0908",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${anton.variable} ${roboto.variable} ${panchang.variable} ${unifrakturCook.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
