"use client"

import { useState, useEffect, useCallback } from "react"

interface UseUnsavedChangesGuardOptions {
  onDiscard: () => void
}

export function useUnsavedChangesGuard(
  isDirty: boolean,
  { onDiscard }: UseUnsavedChangesGuardOptions
) {
  const [showPrompt, setShowPrompt] = useState(false)

  // Prevent browser close / page reload
  useEffect(() => {
    if (!isDirty) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
    }
    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [isDirty])

  // Prevent browser back / forward
  useEffect(() => {
    if (!isDirty) return
    // Push a guard history entry so the next "back" pops this guard, not the real page
    window.history.pushState(null, "", window.location.href)
    const handler = () => {
      // Re-push to prevent actual navigation
      window.history.pushState(null, "", window.location.href)
      setShowPrompt(true)
    }
    window.addEventListener("popstate", handler)
    return () => window.removeEventListener("popstate", handler)
  }, [isDirty])

  const triggerClose = useCallback(() => {
    if (isDirty) {
      setShowPrompt(true)
    } else {
      onDiscard()
    }
  }, [isDirty, onDiscard])

  const confirmDiscard = useCallback(() => {
    setShowPrompt(false)
    onDiscard()
  }, [onDiscard])

  const keepEditing = useCallback(() => {
    setShowPrompt(false)
  }, [])

  return { showPrompt, triggerClose, confirmDiscard, keepEditing }
}
