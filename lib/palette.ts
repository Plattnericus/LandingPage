/**
 * "Clawd Terracotta" palette — the TS mirror of the CSS custom properties
 * in app/globals.css. Consumed by canvas/WebGL/OG-image code that cannot
 * read CSS variables.
 */
export const PALETTE = {
  /** warm black — page start background, ink on light surfaces */
  dark: "#0b0908",
  /** favicon tile (slightly lifted from dark so the rounded tile reads) */
  tile: "#14100d",
  /** warm white — the light half of the page */
  light: "#f2ede6",
  /** primary terracotta — accent on dark surfaces */
  accent: "#d97757",
  /** deep rust — accent on light surfaces */
  accentStrong: "#a63d22",
  /** Clawd's skin tone — decorative only (glows, gradients, wordmark) */
  accentSoft: "#de886d",
  /** warm grey — secondary text on dark */
  grey: "#a29a92",
} as const;
