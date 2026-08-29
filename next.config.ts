import type { NextConfig } from "next";

// No remote image allowlist: the only remote images are Goodreads covers, and
// those render `unoptimized` (see the reading page), which skips the optimizer
// and its host check alike. Everything else next/image touches is local.
const nextConfig: NextConfig = {};

export default nextConfig;
