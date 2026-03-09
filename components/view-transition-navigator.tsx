"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

/**
 * Module-level resolve handle. When a view transition is in flight, this
 * holds the function that resolves its promise (i.e. signals to the browser
 * that the new page is ready to be snapshotted). Kept outside of React so it
 * can be written by TransitionLink and read by the ViewTransitionNavigator
 * component without needing a context or prop-drilling.
 */
let pendingResolve: (() => void) | null = null

/**
 * Start a view transition for an imminent navigation.
 *
 * Call this in a capture-phase click handler on the navigating element,
 * *before* Next.js's own handler runs. The browser will immediately snapshot
 * the current page, then wait for `pendingResolve` to be called (which
 * ViewTransitionNavigator does once `usePathname` reports the new route).
 *
 * Safe to call only from components that are never rendered inside an overlay
 * (drawer, dialog, sheet). For those, use a plain Next.js <Link> instead.
 */
export function triggerViewTransition() {
  if (!("startViewTransition" in document)) return

  // Resolve any previous in-flight transition before starting a new one.
  pendingResolve?.()
  pendingResolve = null

  document.startViewTransition(() => {
    let timeoutId: ReturnType<typeof setTimeout>
    return new Promise<void>((resolve) => {
      pendingResolve = resolve
      // Safety net: resolve after 3 s in case navigation never commits.
      timeoutId = setTimeout(() => {
        if (pendingResolve === resolve) pendingResolve = null
        resolve()
      }, 3000)
    }).finally(() => clearTimeout(timeoutId))
  })
}

/**
 * Resolves any pending view transition once the new page has been committed
 * to the DOM (detected via usePathname).
 *
 * Mount once at the root layout. Does not intercept any events itself —
 * transitions are triggered explicitly via triggerViewTransition().
 */
export function ViewTransitionNavigator() {
  const pathname = usePathname()

  useEffect(() => {
    pendingResolve?.()
    pendingResolve = null
  }, [pathname])

  return null
}
