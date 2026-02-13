import { useMediaQuery } from "@uidotdev/usehooks"

const MOBILE_BREAKPOINT = 768

/**
 * Hook to detect mobile viewport.
 * Uses @uidotdev/usehooks for reliable SSR-safe media query detection.
 */
export function useIsMobile() {
  return useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
}
