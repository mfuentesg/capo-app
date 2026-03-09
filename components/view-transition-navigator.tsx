"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"

/**
 * Enables View Transition animations for all client-side navigations.
 *
 * Strategy: intercept every internal-link click in the capture phase
 * (before Next.js's own handler fires), immediately call
 * document.startViewTransition so the browser snapshots the current page,
 * then resolve the transition promise once usePathname changes — i.e. once
 * React has committed the new page to the DOM.
 *
 * Because we do NOT call e.preventDefault(), Next.js handles the actual
 * navigation normally (prefetch cache, scroll, replace/push semantics, etc.).
 */
export function ViewTransitionNavigator() {
  const pathname = usePathname()
  const resolveRef = useRef<(() => void) | null>(null)

  // When the pathname changes, the new page is in the DOM — resolve the
  // pending transition so the browser can snapshot the new state.
  useEffect(() => {
    resolveRef.current?.()
    resolveRef.current = null
  }, [pathname])

  useEffect(() => {
    if (!("startViewTransition" in document)) return

    function onClick(e: MouseEvent) {
      // Ignore modifier-key clicks (open in new tab, etc.)
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return

      const anchor = (e.target as HTMLElement).closest<HTMLAnchorElement>("a[href]")
      if (!anchor) return

      let url: URL
      try {
        url = new URL(anchor.href, location.href)
      } catch {
        return
      }

      // Only same-origin navigations
      if (url.origin !== location.origin) return
      // Skip _blank targets and downloads
      if (anchor.target && anchor.target !== "_self") return
      if (anchor.hasAttribute("download")) return
      // Skip hash-only jumps on the same page
      if (url.pathname === location.pathname && url.search === location.search) return

      document.startViewTransition(
        () =>
          new Promise<void>((resolve) => {
            resolveRef.current = resolve
          })
      )
    }

    // Capture phase runs before the <Link> element's own click handler,
    // so the transition is started before router.push is called.
    document.addEventListener("click", onClick, { capture: true })
    return () => document.removeEventListener("click", onClick, { capture: true })
  }, [])

  return null
}
