"use client"

import { useCallback, useState } from "react"
import { importSongFromUrl } from "../api/actions"
import type { ImportedSong } from "../utils/import/types"

export type ImportState = "idle" | "loading" | "done" | "error"

interface UseUrlImportOptions {
  onSuccess: (imported: ImportedSong) => void
  messages: { unsupportedPlatform: string; fetchFailed: string }
}

export function useUrlImport({ onSuccess, messages }: UseUrlImportOptions) {
  const [importUrl, setImportUrlState] = useState("")
  const [importState, setImportState] = useState<ImportState>("idle")
  const [importError, setImportError] = useState("")

  const setImportUrl = useCallback((url: string) => {
    setImportUrlState(url)
    setImportState("idle")
    setImportError("")
  }, [])

  const handleImport = useCallback(async () => {
    const url = importUrl.trim()
    if (!url) return
    setImportState("loading")
    setImportError("")
    try {
      const imported = await importSongFromUrl(url)
      onSuccess(imported)
      setImportState("done")
    } catch (err) {
      const msg = err instanceof Error ? err.message : ""
      setImportError(
        msg === "unsupportedPlatform" ? messages.unsupportedPlatform : messages.fetchFailed
      )
      setImportState("error")
    }
  }, [importUrl, onSuccess, messages.unsupportedPlatform, messages.fetchFailed])

  const reset = useCallback(() => {
    setImportUrlState("")
    setImportState("idle")
    setImportError("")
  }, [])

  return { importUrl, setImportUrl, importState, importError, handleImport, reset }
}
