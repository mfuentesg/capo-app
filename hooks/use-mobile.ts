import { useEffect, useState } from "react"

const MOBILE_BREAKPOINT = 768

/**
 * Hook to detect mobile viewport.
 * Returns false during SSR and updates after hydration.
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [])

  return isMobile
}
