import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  transpilePackages: ["@workspace/ui"],
  redirects() {
    return [{ source: "/", destination: "/users", permanent: false }]
  },
}

export default nextConfig
