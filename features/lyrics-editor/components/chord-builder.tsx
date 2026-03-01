"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/hooks/use-translation"
import { parseChordString, buildChordString } from "../utils/chord-pro-visual"

const SHARP_NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
const FLAT_NOTES = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"]

const QUALITIES = [
  { label: "maj", value: "" },
  { label: "m", value: "m" },
  { label: "7", value: "7" },
  { label: "maj7", value: "maj7" },
  { label: "m7", value: "m7" },
  { label: "dim", value: "dim" },
  { label: "aug", value: "aug" },
  { label: "sus2", value: "sus2" },
  { label: "sus4", value: "sus4" },
  { label: "add9", value: "add9" },
  { label: "dim7", value: "dim7" },
  { label: "m7b5", value: "m7b5" }
]

interface ChordBuilderProps {
  value: string | null
  onConfirm: (chord: string) => void
  onRemove: () => void
  onCancel: () => void
}

export function ChordBuilder({ value, onConfirm, onRemove, onCancel }: ChordBuilderProps) {
  const { t } = useTranslation()
  const [root, setRoot] = useState<string | null>(null)
  const [quality, setQuality] = useState("")
  const [bass, setBass] = useState<string | null>(null)
  const [useFlats, setUseFlats] = useState(false)

  useEffect(() => {
    if (value) {
      const parsed = parseChordString(value)
      setRoot(parsed.root)
      setQuality(parsed.quality)
      setBass(parsed.bass)
      // Auto-detect flats from root or bass
      const hasFlat = parsed.root.includes("b") || (parsed.bass?.includes("b") ?? false)
      setUseFlats(hasFlat)
    }
  }, [value])

  const notes = useFlats ? FLAT_NOTES : SHARP_NOTES
  const chordName = root ? buildChordString(root, quality, bass) : null
  const isEditing = value !== null

  const handleRootSelect = (note: string) => {
    // Normalize: if switching between sharp/flat modes, find equivalent
    setRoot(note)
  }

  const handleConfirm = () => {
    if (!chordName) return
    onConfirm(chordName)
  }

  return (
    <div className="p-3 space-y-3 w-64">
      {/* Preview */}
      <div className="text-center py-1">
        <span className={cn("text-2xl font-bold", chordName ? "text-primary" : "text-muted-foreground")}>
          {chordName ?? "—"}
        </span>
      </div>

      <Separator />

      {/* Root note */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">
            {t.songs.lyrics.chordBuilder.rootNote}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-5 px-1.5 text-xs"
            onClick={() => setUseFlats((f: boolean) => !f)}
          >
            {useFlats ? t.songs.lyrics.chordBuilder.flats : t.songs.lyrics.chordBuilder.sharps}
          </Button>
        </div>
        <div className="grid grid-cols-6 gap-1">
          {notes.map((note) => (
            <Button
              key={note}
              variant={root === note ? "default" : "outline"}
              size="sm"
              className="h-7 px-0 text-xs"
              onClick={() => handleRootSelect(note)}
            >
              {note}
            </Button>
          ))}
        </div>
      </div>

      {/* Quality — only show once root is picked */}
      {root && (
        <>
          <Separator />
          <div className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              {t.songs.lyrics.chordBuilder.quality}
            </span>
            <div className="grid grid-cols-4 gap-1">
              {QUALITIES.map((q) => (
                <Button
                  key={q.value}
                  variant={quality === q.value ? "default" : "outline"}
                  size="sm"
                  className="h-7 px-0 text-xs"
                  onClick={() => setQuality(q.value)}
                >
                  {q.label}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Bass note */}
          <div className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              {t.songs.lyrics.chordBuilder.bassNote}
            </span>
            <div className="grid grid-cols-7 gap-1">
              <Button
                variant={bass === null ? "default" : "outline"}
                size="sm"
                className="h-7 px-0 text-xs"
                onClick={() => setBass(null)}
              >
                —
              </Button>
              {notes.map((note) => (
                <Button
                  key={note}
                  variant={bass === note ? "default" : "outline"}
                  size="sm"
                  className="h-7 px-0 text-xs"
                  onClick={() => setBass(note)}
                >
                  {note}
                </Button>
              ))}
            </div>
          </div>
        </>
      )}

      <Separator />

      {/* Actions */}
      <div className="flex gap-2">
        {isEditing ? (
          <>
            <Button variant="destructive" size="sm" className="flex-none" onClick={onRemove}>
              {t.songs.lyrics.chordBuilder.removeChord}
            </Button>
            <Button
              variant="default"
              size="sm"
              className="flex-1"
              disabled={!chordName}
              onClick={handleConfirm}
            >
              {t.songs.lyrics.chordBuilder.updateChord}
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" size="sm" className="flex-none" onClick={onCancel}>
              {t.common.cancel}
            </Button>
            <Button
              variant="default"
              size="sm"
              className="flex-1"
              disabled={!chordName}
              onClick={handleConfirm}
            >
              {t.songs.lyrics.chordBuilder.addChord}
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
