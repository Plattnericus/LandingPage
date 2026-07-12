import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    /* Next 16 requires every quality passed to next/image to be allowlisted
       (default is [75]). The ProjectPreview posters request 78, so both are
       declared here — this keeps the authored quality instead of silently
       coercing it down to 75. */
    qualities: [75, 78],
  },
};

export default nextConfig;
