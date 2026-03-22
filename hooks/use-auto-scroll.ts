"use client"

import { useCallback, useEffect, useRef, useState, type RefObject } from "react"

interface UseAutoScrollOptions {
  speed: number
  containerRef: RefObject<HTMLElement | null>
}

interface UseAutoScrollResult {
  isScrolling: boolean
  start: () => void
  stop: () => void
  toggle: () => void
}

function getScrollTarget(containerRef: RefObject<HTMLElement | null>): HTMLElement | Window {
  if (containerRef.current) {
    const found = containerRef.current.closest(".overflow-y-auto")
    if (found instanceof HTMLElement) return found
  }
  return window
}

function isAtBottom(target: HTMLElement | Window): boolean {
  if (target === window) {
    return window.scrollY + window.innerHeight >= document.body.scrollHeight - 2
  }
  const el = target as HTMLElement
  return el.scrollTop + el.clientHeight >= el.scrollHeight - 2
}

function scrollByAmount(target: HTMLElement | Window, amount: number): void {
  if (target === window) {
    window.scrollBy({ top: amount })
  } else {
    ;(target as HTMLElement).scrollTop += amount
  }
}

export function useAutoScroll({ speed, containerRef }: UseAutoScrollOptions): UseAutoScrollResult {
  const [isScrolling, setIsScrolling] = useState(false)
  const rafRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number | null>(null)
  const isScrollingRef = useRef(false)
  const speedRef = useRef(speed)

  useEffect(() => {
    speedRef.current = speed
  }, [speed])

  const stop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    lastTimeRef.current = null
    isScrollingRef.current = false
    setIsScrolling(false)
  }, [])

  const start = useCallback(() => {
    if (isScrollingRef.current) return

    isScrollingRef.current = true
    setIsScrolling(true)

    const tick = (now: number) => {
      if (!isScrollingRef.current) return

      const target = getScrollTarget(containerRef)

      if (isAtBottom(target)) {
        isScrollingRef.current = false
        rafRef.current = null
        lastTimeRef.current = null
        setIsScrolling(false)
        return
      }

      if (lastTimeRef.current !== null) {
        const delta = (now - lastTimeRef.current) / 1000
        scrollByAmount(target, speedRef.current * delta)
      }

      lastTimeRef.current = now
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
  }, [containerRef])

  const toggle = useCallback(() => {
    if (isScrollingRef.current) {
      stop()
    } else {
      start()
    }
  }, [start, stop])

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [])

  return { isScrolling, start, stop, toggle }
}
