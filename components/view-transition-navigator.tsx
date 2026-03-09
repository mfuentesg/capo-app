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
  // Tracks the latest committed pathname so the startViewTransition callback
  // can detect whether navigation already completed before it was invoked.
  // On desktop (fast prefetch / hardware), the pathname effect can fire before
  // startViewTransition even calls its update callback, leaving resolveRef null
  // and the promise hanging for the full 3-second safety timeout.
  const committedPathnameRef = useRef(pathname)

  // When the pathname changes, the new page is in the DOM — resolve the
  // pending transition so the browser can snapshot the new state.
  useEffect(() => {
    committedPathnameRef.current = pathname
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
      // Skip same-pathname navigations (hash jumps, search-param changes).
      // usePathname() won't update for these, so the transition promise
      // would never resolve.
      if (url.pathname === location.pathname) return

      // Skip transitions for links inside overlay components, or if any overlay
      // is currently open in the document. startViewTransition can disrupt the
      // overlay's close animation, preventing animationend/transitionend from
      // firing and leaving fixed overlays stuck in the DOM blocking all input.
      //
      // Two-pronged check for maximum reliability:
      // 1. Ancestor check — covers clicks from inside the overlay (e.g. nav
      //    links, "Open song" links inside the songs drawer). Checks for vaul v1
      //    ([data-vaul-drawer]), Radix ([role="dialog"]), and our own wrappers.
      // 2. Document-level check — catches any case the ancestor walk might miss
      //    (e.g. SVG targets, portal boundary edge cases in some mobile browsers).
      const isInsideOverlay = !!(e.target as HTMLElement).closest(
        '[role="dialog"],[data-vaul-drawer],[data-slot="drawer-content"],[data-slot="sheet-content"]'
      )
      const hasOpenOverlay = !!document.querySelector(
        '[data-vaul-drawer][data-state="open"],[data-slot="drawer-content"][data-state="open"],[data-slot="sheet-content"][data-state="open"]'
      )
      if (isInsideOverlay || hasOpenOverlay) return

      const targetPathname = url.pathname

      // Resolve any in-flight transition before starting a new one, so the
      // old promise doesn't hang if the user navigates again mid-flight.
      resolveRef.current?.()
      resolveRef.current = null

      document.startViewTransition(() => {
        let timeoutId: ReturnType<typeof setTimeout>
        return new Promise<void>((resolve) => {
          // On desktop, prefetched navigations can complete and update the
          // pathname before startViewTransition invokes this callback. In that
          // case resolveRef was already null when the pathname effect ran, so
          // we must resolve immediately here instead of waiting.
          if (committedPathnameRef.current === targetPathname) {
            resolve()
            return
          }
          resolveRef.current = resolve
          // Safety net: resolve after 3 s in case navigation never commits.
          timeoutId = setTimeout(() => {
            if (resolveRef.current === resolve) resolveRef.current = null
            resolve()
          }, 3000)
        }).finally(() => clearTimeout(timeoutId))
      })
    }

    // Capture phase runs before the <Link> element's own click handler,
    // so the transition is started before router.push is called.
    document.addEventListener("click", onClick, { capture: true })
    return () => document.removeEventListener("click", onClick, { capture: true })
  }, [])

  return null
}
