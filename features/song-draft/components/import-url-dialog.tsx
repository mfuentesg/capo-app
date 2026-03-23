"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog"
import { importSongFromUrl } from "../api/import-actions"
import type { DraftSong } from "../types"
import { useTranslation } from "@/hooks/use-translation"

interface ImportUrlDialogProps {
  open: boolean
  onClose: () => void
  onImported: (song: DraftSong) => void
}

type Step = "input" | "preview"

export function ImportUrlDialog({ open, onClose, onImported }: ImportUrlDialogProps) {
  const { t } = useTranslation()
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<Step>("input")
  const [parsed, setParsed] = useState<DraftSong | null>(null)

  const handleClose = () => {
    setUrl("")
    setError(null)
    setStep("input")
    setParsed(null)
    onClose()
  }

  const handleParse = async () => {
    setLoading(true)
    setError(null)
    try {
      const song = await importSongFromUrl(url)
      setParsed(song)
      setStep("preview")
    } catch (e) {
      setError(e instanceof Error ? e.message : t.editor.unsupportedPlatform)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = () => {
    if (parsed) {
      onImported(parsed)
      handleClose()
    }
  }

  const { lyricsPreview, lyricsTruncated } = useMemo(() => {
    if (!parsed?.lyrics) return { lyricsPreview: "", lyricsTruncated: false }
    const lines = parsed.lyrics.split("\n")
    return {
      lyricsPreview: lines.slice(0, 6).join("\n"),
      lyricsTruncated: lines.length > 6
    }
  }, [parsed?.lyrics])

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t.editor.importDialogTitle}</DialogTitle>
          <DialogDescription>
            {step === "input" ? t.editor.importDialogDescription : t.editor.importPreviewTitle}
          </DialogDescription>
        </DialogHeader>

        {step === "input" && (
          <div className="flex flex-col gap-4">
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={t.editor.importUrlPlaceholder}
              onKeyDown={(e) => {
                if (e.key === "Enter" && url && !loading) void handleParse()
              }}
              autoFocus
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={handleClose}>
                {t.editor.importCancel}
              </Button>
              <Button disabled={!url || loading} onClick={() => void handleParse()}>
                {loading ? t.editor.importParsing : t.editor.importParse}
              </Button>
            </div>
          </div>
        )}

        {step === "preview" && parsed && (
          <div className="flex flex-col gap-4">
            <div className="rounded-md border bg-muted/40 p-3 text-sm space-y-1">
              <div>
                <span className="font-medium">{parsed.title}</span>
                {parsed.artist && (
                  <span className="text-muted-foreground"> — {parsed.artist}</span>
                )}
              </div>
              {parsed.key && (
                <div className="text-muted-foreground text-xs">Key: {parsed.key}</div>
              )}
            </div>

            {lyricsPreview && (
              <div className="flex flex-col gap-1">
                <p className="text-xs font-medium text-muted-foreground">
                  {t.editor.importPreviewLyricsLabel}
                </p>
                <pre className="rounded-md border bg-muted/40 p-3 text-xs font-mono overflow-x-auto whitespace-pre-wrap max-h-36">
                  {lyricsPreview}
                  {lyricsTruncated && "\n…"}
                </pre>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setStep("input")
                  setError(null)
                }}
              >
                {t.editor.importBack}
              </Button>
              <Button onClick={handleConfirm}>{t.editor.importConfirm}</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
