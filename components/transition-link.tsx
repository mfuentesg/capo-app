"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { triggerViewTransition } from "@/components/view-transition-navigator"

/**
 * A drop-in replacement for Next.js <Link> that starts a view transition
 * before the navigation fires, producing the animated page-change effect.
 *
 * HOW IT WORKS
 * A native capture-phase click handler is attached directly to the rendered
 * <a> element. It fires before React's synthetic bubble-phase handlers (and
 * therefore before Next.js's own router.push logic), so the browser can
 * snapshot the current page state before anything changes.
 *
 * IMPORTANT — only use this component where no overlay is open when the link
 * can be clicked (e.g. the desktop navigation bar). For links that live inside
 * a Drawer, Dialog, or Sheet, use a plain Next.js <Link> instead. Calling
 * document.startViewTransition while an overlay is closing can disrupt the
 * overlay's exit animation (preventing animationend/transitionend from
 * firing), which leaves the fixed overlay panel stuck in the DOM and
 * blocking all pointer events.
 */
export function TransitionLink({
  href,
  children,
  onClick,
  ...props
}: React.ComponentProps<typeof Link>) {
  const ref = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    const anchor = ref.current
    if (!anchor) return

    function handleClick(e: MouseEvent) {
      // Let modifier-key clicks (new tab, download, etc.) behave normally.
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return

      let url: URL
      try {
        url = new URL(anchor!.href, location.href)
      } catch {
        return
      }

      if (url.origin !== location.origin) return
      if (anchor!.target && anchor!.target !== "_self") return
      if (anchor!.hasAttribute("download")) return
      // Same-pathname navigations won't update usePathname, so the promise
      // would never resolve — skip them.
      if (url.pathname === location.pathname) return

      triggerViewTransition()
    }

    // Capture phase fires before React's bubble-phase handlers, ensuring the
    // browser snapshots the current page before Next.js starts navigating.
    anchor.addEventListener("click", handleClick, { capture: true })
    return () => anchor.removeEventListener("click", handleClick, { capture: true })
  }, [])

  return (
    <Link ref={ref} href={href} onClick={onClick} {...props}>
      {children}
    </Link>
  )
}
