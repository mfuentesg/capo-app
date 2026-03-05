"use client"

import * as React from "react"
// @ts-expect-error - no types for this library
import Chord from "@tombatossals/react-chords/lib/Chord"
import guitarDataRaw from "@tombatossals/chords-db/lib/guitar.json"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLocale } from "@/features/settings"

interface ChordPosition {
  frets: number[]
  fingers: number[]
  baseFret: number
  barres: number[]
  capo?: boolean
  midi: number[]
}

interface ChordVariation {
  key: string
  suffix: string
  positions: ChordPosition[]
}

interface GuitarData {
  main: {
    strings: number
    fretsOnChord: number
    name: string
    numberOfChords: number
  }
  tunings: {
    standard: string[]
  }
  keys: string[]
  suffixes: string[]
  chords: Record<string, ChordVariation[]>
}

const guitarData = guitarDataRaw as unknown as GuitarData

interface ChordDiagramProps {
  chordName: string | null
  onClose: () => void
}

// Normalize chord names to the database
function parseChord(chordName: string) {
  if (!chordName) return null

  // Split key and suffix
  // Key is [A-G][#b]?
  const match = chordName.match(/^([A-G][#b]?)(.*)$/)
  if (!match) return null

  const [, rawKey, rawSuffix] = match
  let key = rawKey
  let suffix = rawSuffix

  // Normalize key
  const keyMap: Record<string, string> = {
    "A#": "Bb",
    Db: "C#",
    "D#": "Eb",
    Gb: "F#",
    "G#": "Ab",
  }

  if (keyMap[key]) {
    key = keyMap[key]
  }

  // Normalize suffix
  if (!suffix || suffix === "") {
    suffix = "major"
  } else if (suffix === "m") {
    suffix = "minor"
  }

  // Handle common suffixes that might not match exactly
  const suffixMap: Record<string, string> = {
    maj: "major",
    min: "minor",
    dim7: "dim7",
    sus2: "sus2",
    sus4: "sus4",
  }

  if (suffixMap[suffix]) {
    suffix = suffixMap[suffix]
  }

  return { key, suffix }
}

export function ChordDiagram({ chordName, onClose }: ChordDiagramProps) {
  const [positionIndex, setPositionIndex] = React.useState(0)
  const { t } = useLocale()

  React.useEffect(() => {
    setPositionIndex(0)
  }, [chordName])

  if (!chordName) return null

  const parsed = parseChord(chordName)
  if (!parsed) return null

  const { key, suffix } = parsed
  const chordVariations = guitarData.chords[key]?.find((c) => c.suffix === suffix)

  if (!chordVariations) {
    return (
      <Dialog open={!!chordName} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t.chords.title.replace("{chordName}", chordName)}</DialogTitle>
            <DialogDescription>{t.chords.noDiagram}</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )
  }

  const positions = chordVariations.positions
  const currentChord = positions[positionIndex]

  const handlePrev = () => {
    setPositionIndex((prev) => (prev > 0 ? prev - 1 : positions.length - 1))
  }

  const handleNext = () => {
    setPositionIndex((prev) => (prev < positions.length - 1 ? prev + 1 : 0))
  }

  return (
    <Dialog open={!!chordName} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center justify-between">
            <span>{chordName}</span>
            <span className="text-sm font-normal text-muted-foreground">
              {t.chords.positionOf
                .replace("{current}", (positionIndex + 1).toString())
                .replace("{total}", positions.length.toString())}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-6">
          <div className="w-48 h-48 bg-white rounded-lg p-4 flex items-center justify-center shadow-sm border">
            <Chord
              chord={currentChord}
              instrument={{
                ...guitarData.main,
                tunings: guitarData.tunings,
              }}
              lite={false}
            />
          </div>

          {positions.length > 1 && (
            <div className="flex items-center gap-4 mt-6">
              <Button variant="outline" size="icon" onClick={handlePrev}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-sm font-medium">
                {t.chords.variation.replace("{count}", (positionIndex + 1).toString())}
              </div>
              <Button variant="outline" size="icon" onClick={handleNext}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
