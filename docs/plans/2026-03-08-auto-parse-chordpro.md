# Auto-parse Pasted Text to ChordPro — Implementation Plan

**Date:** 2026-03-08
**GitHub Issue:** #36
**Status:** Pending

## Problem

When users paste lyrics from external sources (plain text, tab-style chord notation like `G  C  G  D / line`, or Nashville notation), they have to manually reformat everything to ChordPro syntax. A paste detector should recognize common chord+lyric formats and auto-convert them.

## Approach

Add a CodeMirror extension that intercepts paste events in the `SongEditor`. Run the pasted text through a format detector and converter chain. If a known format is detected, replace the pasted content with the ChordPro equivalent and show a dismissable toast: "Converted from [format] to ChordPro". If no format is recognized, paste as-is.

---

### Task 1: Create a format detector + converter utility

**Files:**
- Create: `features/lyrics-editor/utils/chordpro-converter.ts`

**Supported input formats:**

| Format | Example |
|---|---|
| Inline chord above lyrics | `G      C\nAmazing grace` |
| Bracket inline chords | `[G]Amazing [C]grace` (already ChordPro — no conversion needed) |
| Chord/lyric pairs (tab style) | `Chord: G C Am\nLyric: Amazing grace how sweet` |

```typescript
export type DetectedFormat = "chord-above-lyrics" | "plain-text" | "chordpro"

export interface ConversionResult {
  format: DetectedFormat
  output: string
}

/** Detect the most likely format of the input text */
export function detectFormat(text: string): DetectedFormat {
  if (/\[[A-G][^\]]*\]/.test(text)) return "chordpro"
  // Chord-above-lyrics: alternating lines where odd lines are mostly chord tokens
  const lines = text.split("\n")
  const chordLineCount = lines.filter((l) => isChordLine(l)).length
  if (chordLineCount > 0 && chordLineCount >= lines.length * 0.3) {
    return "chord-above-lyrics"
  }
  return "plain-text"
}

/** True if a line consists mostly of chord tokens (e.g. "G  Am  F  C") */
function isChordLine(line: string): boolean {
  const tokens = line.trim().split(/\s+/).filter(Boolean)
  if (tokens.length === 0) return false
  const chordPattern = /^[A-G][b#]?(m|maj|min|aug|dim|sus|add|M)?[0-9]*(\/[A-G][b#]?)?$/
  const chordCount = tokens.filter((t) => chordPattern.test(t)).length
  return chordCount / tokens.length >= 0.7
}

/**
 * Convert chord-above-lyrics format to ChordPro inline bracket notation.
 * Pairs each chord line with the lyrics line that follows it.
 */
export function convertChordAboveLyrics(text: string): string {
  const lines = text.split("\n")
  const result: string[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    const next = lines[i + 1]

    if (isChordLine(line) && next !== undefined && !isChordLine(next)) {
      // Merge chord line into lyrics line using bracket notation
      result.push(mergeChordAndLyricLines(line, next))
      i += 2
    } else {
      result.push(line)
      i++
    }
  }

  return result.join("\n")
}

function mergeChordAndLyricLines(chordLine: string, lyricLine: string): string {
  // Place each chord at the character position it appears above
  const chords: Array<{ pos: number; chord: string }> = []
  const regex = /(\S+)/g
  let match: RegExpExecArray | null

  while ((match = regex.exec(chordLine)) !== null) {
    chords.push({ pos: match.index, chord: match[1] })
  }

  let result = lyricLine
  // Insert from right to left so positions don't shift
  for (let i = chords.length - 1; i >= 0; i--) {
    const { pos, chord } = chords[i]
    const insertAt = Math.min(pos, result.length)
    result = result.slice(0, insertAt) + `[${chord}]` + result.slice(insertAt)
  }

  return result
}

export function convertToChordPro(text: string): ConversionResult {
  const format = detectFormat(text)

  if (format === "chordpro") return { format, output: text }
  if (format === "chord-above-lyrics") {
    return { format, output: convertChordAboveLyrics(text) }
  }

  return { format: "plain-text", output: text }
}
```

---

### Task 2: Create a CodeMirror paste extension

**Files:**
- Create: `features/lyrics-editor/utils/paste-convert-extension.ts`

```typescript
import { EditorView } from "@codemirror/view"
import { convertToChordPro } from "./chordpro-converter"

interface PasteConvertOptions {
  onConversion?: (format: string) => void
}

export function pasteConvertExtension({ onConversion }: PasteConvertOptions = {}) {
  return EditorView.domEventHandlers({
    paste(event, view) {
      const text = event.clipboardData?.getData("text/plain")
      if (!text) return false

      const { format, output } = convertToChordPro(text)

      if (format === "chord-above-lyrics") {
        event.preventDefault()
        const { from, to } = view.state.selection.main
        view.dispatch({
          changes: { from, to, insert: output }
        })
        onConversion?.(format)
        return true
      }

      return false // let default paste handle chordpro and plain-text
    }
  })
}
```

---

### Task 3: Integrate into `SongEditor`

**Files:**
- Modify: `features/lyrics-editor/components/song-editor.tsx` (the CodeMirror wrapper)

```typescript
import { pasteConvertExtension } from "../utils/paste-convert-extension"
import { toast } from "sonner"

// In the extensions array:
pasteConvertExtension({
  onConversion: (format) => {
    toast.success(`Converted from "${format}" to ChordPro format`)
  }
})
```

---

### Task 4: Tests for the converter utility

**Files:**
- Create: `features/lyrics-editor/__tests__/utils/chordpro-converter.test.ts`

Test cases:
- `detectFormat` recognizes chord-above-lyrics correctly
- `detectFormat` recognizes existing ChordPro (bracket notation) as `chordpro`
- `detectFormat` falls back to `plain-text` for plain prose
- `convertChordAboveLyrics` correctly inserts bracket chords at the right positions
- Multi-verse song converts correctly

---

### Task 5: i18n

```json
{
  "editor": {
    "pasteConverted": "Converted pasted text to ChordPro format"
  }
}
```

---

### Verification

```bash
pnpm lint && pnpm typecheck && pnpm test
```
