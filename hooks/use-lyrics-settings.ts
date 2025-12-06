"use client"

import { useState } from "react"
import { useTranslation } from "@/hooks/use-translation"

interface UseLyricsSettingsOptions {
  initialFontSize?: number
  initialTranspose?: number
  initialCapo?: number
}

export function useLyricsSettings(options?: UseLyricsSettingsOptions) {
  const { t } = useTranslation()
  const [fontSizeValue, setFontSizeValue] = useState(options?.initialFontSize ?? 1) // 1.25rem = 20px default for readable lyrics
  const [transposeValue, setTransposeValue] = useState(options?.initialTranspose ?? 0)
  const [capoValue, setCapoValue] = useState(options?.initialCapo ?? 0)

  const font = {
    value: fontSizeValue,
    increase: () => setFontSizeValue((prev) => Math.min(prev + 0.25, 3)), // max 3rem (48px)
    decrease: () => setFontSizeValue((prev) => Math.max(prev - 0.25, 1)), // min 1rem (16px)
    reset: () => setFontSizeValue(1.25), // 1.25rem (20px)
    isAtDefault: () => fontSizeValue === 1.25,
    isAtMin: () => fontSizeValue <= 1,
    isAtMax: () => fontSizeValue >= 3
  }

  const transpose = {
    value: transposeValue,
    increase: () => setTransposeValue((prev) => Math.min(prev + 1, 6)),
    decrease: () => setTransposeValue((prev) => Math.max(prev - 1, -6)),
    reset: () => setTransposeValue(0),
    isAtDefault: () => transposeValue === 0,
    isAtMin: () => transposeValue <= -6,
    isAtMax: () => transposeValue >= 6,
    display: () => (transposeValue > 0 ? `+${transposeValue}` : transposeValue.toString())
  }

  const capo = {
    value: capoValue,
    increase: () => setCapoValue((prev) => Math.min(prev + 1, 12)),
    decrease: () => setCapoValue((prev) => Math.max(prev - 1, 0)),
    reset: () => setCapoValue(0),
    isAtDefault: () => capoValue === 0,
    isAtMin: () => capoValue === 0,
    isAtMax: () => capoValue >= 12,
    display: () => (capoValue === 0 ? t.songs.none : `${t.songs.fret} ${capoValue}`)
  }

  return {
    font,
    transpose,
    capo
  }
}
