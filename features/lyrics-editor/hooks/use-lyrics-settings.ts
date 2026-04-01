"use client"

import { useState } from "react"
import { useTranslation } from "@/hooks/use-translation"

interface UseLyricsSettingsOptions {
  initialFontSize?: number
  initialTranspose?: number
  initialCapo?: number
  onSettingsChange?: (settings: { capo: number; transpose: number; fontSize: number }) => void
}

export function useLyricsSettings(options?: UseLyricsSettingsOptions) {
  const { t } = useTranslation()
  const [fontSizeValue, setFontSizeValue] = useState(options?.initialFontSize ?? 1)
  const [transposeValue, setTransposeValue] = useState(options?.initialTranspose ?? 0)
  const [capoValue, setCapoValue] = useState(options?.initialCapo ?? 0)

  const notify = (next: { capo: number; transpose: number; fontSize: number }) => {
    options?.onSettingsChange?.(next)
  }

  const font = {
    value: fontSizeValue,
    increase: () => {
      const next = Math.min(fontSizeValue + 0.25, 3)
      setFontSizeValue(next)
      notify({ capo: capoValue, transpose: transposeValue, fontSize: next })
    },
    decrease: () => {
      const next = Math.max(fontSizeValue - 0.25, 0.5)
      setFontSizeValue(next)
      notify({ capo: capoValue, transpose: transposeValue, fontSize: next })
    },
    reset: () => {
      setFontSizeValue(1)
      notify({ capo: capoValue, transpose: transposeValue, fontSize: 1 })
    },
    isAtDefault: () => fontSizeValue === 1,
    isAtMin: () => fontSizeValue <= 0.5,
    isAtMax: () => fontSizeValue >= 3
  }

  const transpose = {
    value: transposeValue,
    increase: () => {
      const next = Math.min(transposeValue + 1, 6)
      setTransposeValue(next)
      notify({ capo: capoValue, transpose: next, fontSize: fontSizeValue })
    },
    decrease: () => {
      const next = Math.max(transposeValue - 1, -6)
      setTransposeValue(next)
      notify({ capo: capoValue, transpose: next, fontSize: fontSizeValue })
    },
    reset: () => {
      setTransposeValue(0)
      notify({ capo: capoValue, transpose: 0, fontSize: fontSizeValue })
    },
    isAtDefault: () => transposeValue === 0,
    isAtMin: () => transposeValue <= -6,
    isAtMax: () => transposeValue >= 6,
    display: () => (transposeValue > 0 ? `+${transposeValue}` : transposeValue.toString())
  }

  const capo = {
    value: capoValue,
    increase: () => {
      const next = Math.min(capoValue + 1, 12)
      setCapoValue(next)
      notify({ capo: next, transpose: transposeValue, fontSize: fontSizeValue })
    },
    decrease: () => {
      const next = Math.max(capoValue - 1, 0)
      setCapoValue(next)
      notify({ capo: next, transpose: transposeValue, fontSize: fontSizeValue })
    },
    reset: () => {
      setCapoValue(0)
      notify({ capo: 0, transpose: transposeValue, fontSize: fontSizeValue })
    },
    isAtDefault: () => capoValue === 0,
    isAtMin: () => capoValue === 0,
    isAtMax: () => capoValue >= 12,
    display: () => (capoValue === 0 ? t.songs.none : `${t.songs.fret} ${capoValue}`)
  }

  const hasModifications = () => {
    return !font.isAtDefault() || !transpose.isAtDefault() || !capo.isAtDefault()
  }

  const resetAll = () => {
    setFontSizeValue(1)
    setTransposeValue(0)
    setCapoValue(0)
    notify({ capo: 0, transpose: 0, fontSize: 1 })
  }

  return {
    font,
    transpose,
    capo,
    hasModifications,
    resetAll
  }
}
