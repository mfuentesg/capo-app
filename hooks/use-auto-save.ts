"use client"

import { useState, useEffect, useRef, useCallback } from "react"

export type AutoSaveStatus = "idle" | "pending" | "saving" | "saved" | "error"

interface UseAutoSaveOptions {
  delay?: number
  enabled?: boolean
}

export function useAutoSave<T>(
  value: T,
  saveFn: (value: T) => Promise<void>,
  { delay = 1500, enabled = true }: UseAutoSaveOptions = {}
): { status: AutoSaveStatus } {
  const [status, setStatus] = useState<AutoSaveStatus>("idle")
  const isFirstMount = useRef(true)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const saveFnRef = useRef(saveFn)
  useEffect(() => {
    saveFnRef.current = saveFn
  })

  const clearPending = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false
      return
    }

    if (!enabled) {
      return
    }

    clearPending()
    setStatus("pending")

    timeoutRef.current = setTimeout(async () => {
      setStatus("saving")
      try {
        await saveFnRef.current(value)
        setStatus("saved")
      } catch {
        setStatus("error")
      }
    }, delay)

    return () => {
      clearPending()
    }
  }, [value, enabled, delay, clearPending])

  // Cleanup on unmount
  useEffect(() => clearPending, [clearPending])

  return { status }
}
