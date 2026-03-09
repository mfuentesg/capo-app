import type { NextConfig } from "next"
import withBundleAnalyzer from "@next/bundle-analyzer"
import withSerwistInit from "@serwist/next"

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  cacheOnNavigation: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development"
})

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["lucide-react", "radix-ui", "react-day-picker", "@hello-pangea/dnd"],
    viewTransition: true
  },
  async headers() {
    return [
      {
        // Apply cache headers to optimized logo images
        source: "/img/optimized/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable"
          }
        ]
      },
      {
        // Also cache SVG logos (though they're used less now)
        source: "/img/:path*.svg",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable"
          }
        ]
      }
    ]
  }
}

export default withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true"
})(withSerwist(nextConfig))
