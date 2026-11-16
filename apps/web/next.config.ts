import path from "node:path"

import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  experimental: {
    agentFeedback: true,
  },
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname, "../../"),
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  transpilePackages: ["@workspace/ui"],
  redirects() {
    return [{ source: "/", destination: "/users", permanent: false }]
  },
}

export default nextConfig
