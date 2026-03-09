import type { PrecacheEntry, SerwistGlobalConfig } from "serwist"
import { Serwist, NetworkFirst, CacheFirst, StaleWhileRevalidate, ExpirationPlugin } from "serwist"

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined
  }
}

declare const self: ServiceWorkerGlobalScope

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,

  runtimeCaching: [
    // Fonts: cache-first, 1 year
    {
      matcher: ({ request }) => request.destination === "font",
      handler: new CacheFirst({
        cacheName: "fonts",
        plugins: [new ExpirationPlugin({ maxEntries: 20, maxAgeSeconds: 365 * 24 * 60 * 60 })]
      })
    },
    // Optimized images: cache-first, 1 year (also covered by Cache-Control headers)
    {
      matcher: ({ url }) => url.pathname.startsWith("/img/optimized/"),
      handler: new CacheFirst({
        cacheName: "static-images",
        plugins: [new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 365 * 24 * 60 * 60 })]
      })
    },
    // Next.js static chunks: stale-while-revalidate
    {
      matcher: ({ url }) => url.pathname.startsWith("/_next/static/"),
      handler: new StaleWhileRevalidate({
        cacheName: "next-static",
        plugins: [new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 })]
      })
    },
    // Navigation requests: network-first, fall back to cache when offline
    {
      matcher: ({ request }) => request.mode === "navigate",
      handler: new NetworkFirst({
        cacheName: "pages",
        plugins: [new ExpirationPlugin({ maxEntries: 30, maxAgeSeconds: 24 * 60 * 60 })]
      })
    }
  ],

  fallbacks: {
    entries: [
      {
        url: "/~offline",
        matcher({ request }) {
          return request.destination === "document"
        }
      }
    ]
  }
})

serwist.addEventListeners()
