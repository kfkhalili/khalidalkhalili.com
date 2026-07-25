import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Goodreads spreads covers across subdomains: i. for artwork, s. for the
    // "no photo" placeholder. `next/image` throws on a host it wasn't told
    // about, and this page renders per request, so an unlisted one would be a
    // 500 rather than a missing image. lib/goodreads.ts drops covers from any
    // host outside this pattern for the same reason.
    remotePatterns: [{ protocol: "https", hostname: "**.gr-assets.com" }],
  },
};

export default nextConfig;
