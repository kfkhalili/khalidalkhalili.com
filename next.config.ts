import type { NextConfig } from "next";

// No remote image allowlist: the only remote images are Goodreads covers, and
// those render `unoptimized` (see the reading page), which skips the optimizer
// and its host check alike. Everything else next/image touches is local.
const nextConfig: NextConfig = {
  // The project root is where this config lives: without it, a build from a
  // git worktree infers the root from the nearest lockfile it can find.
  turbopack: { root: __dirname },
  // The site used to publish under /en, /de, and /ar. It is English-only at
  // the root now, and the old locale-prefixed URLs live on in links and search
  // indexes, so each redirects permanently to its root address.
  async redirects() {
    return [
      {
        source: "/:lang(en|de|ar)",
        destination: "/",
        permanent: true,
      },
      {
        source: "/:lang(en|de|ar)/:path*",
        destination: "/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
