import { ChordProParser } from "chordsheetjs"

export type ChordToken = {
  chord: string | null
  lyric: string
}

export type VisualLine =
  | { type: "chord-lyric"; tokens: ChordToken[] }
  | { type: "directive"; raw: string }
  | { type: "empty" }

export function parseToVisual(chordpro: string): VisualLine[] {
  if (!chordpro.trim()) {
    return [{ type: "chord-lyric", tokens: [{ chord: null, lyric: "" }] }]
  }

  try {
    const parser = new ChordProParser()
    const song = parser.parse(chordpro)

    const lines: VisualLine[] = song.lines.map((line) => {
      if (!line.items || line.items.length === 0) {
        return { type: "empty" }
      }

      // Check if first item is a directive/tag (has name property but not chords/lyrics)
      const firstItem = line.items[0] as Record<string, unknown>
      if (firstItem.name !== undefined && firstItem.chords === undefined) {
        const name = String(firstItem.name ?? "")
        const value = firstItem.value !== undefined ? String(firstItem.value) : ""
        const raw = value ? `{${name}: ${value}}` : `{${name}}`
        return { type: "directive", raw }
      }

      const tokens: ChordToken[] = line.items.map((item) => {
        const pair = item as Record<string, unknown>
        return {
          chord: pair.chords ? String(pair.chords) : null,
          lyric: pair.lyrics ? String(pair.lyrics) : ""
        }
      })

      return { type: "chord-lyric", tokens }
    })

    return lines.length > 0 ? lines : [{ type: "chord-lyric", tokens: [{ chord: null, lyric: "" }] }]
  } catch {
    // Fallback: split on newlines and produce simple lyric-only tokens
    return chordpro.split("\n").map((line): VisualLine => {
      if (!line) return { type: "empty" }
      return { type: "chord-lyric", tokens: [{ chord: null, lyric: line }] }
    })
  }
}

export function visualToChordPro(lines: VisualLine[]): string {
  return lines
    .map((line) => {
      if (line.type === "empty") return ""
      if (line.type === "directive") return line.raw
      // chord-lyric: serialize tokens
      return line.tokens
        .map((t) => (t.chord ? `[${t.chord}]` : "") + t.lyric)
        .join("")
    })
    .join("\n")
}

export function parseChordString(chord: string): {
  root: string
  quality: string
  bass: string | null
} {
  const slashIdx = chord.indexOf("/")
  const bass = slashIdx !== -1 ? chord.slice(slashIdx + 1) : null
  const main = slashIdx !== -1 ? chord.slice(0, slashIdx) : chord

  const match = main.match(/^([A-G][#b]?)(.*)$/)
  if (!match) return { root: chord, quality: "", bass }

  return { root: match[1], quality: match[2], bass }
}

export function buildChordString(root: string, quality: string, bass: string | null): string {
  return root + quality + (bass ? `/${bass}` : "")
}

/** Insert a chord at a specific character offset within a token, splitting it. */
export function insertChordAt(
  lines: VisualLine[],
  lineIdx: number,
  tokenIdx: number,
  charOffset: number,
  chord: string
): VisualLine[] {
  const newLines = structuredClone(lines)
  const line = newLines[lineIdx]
  if (line.type !== "chord-lyric") return newLines

  const token = line.tokens[tokenIdx]
  const before = token.lyric.slice(0, charOffset)
  const after = token.lyric.slice(charOffset)

  line.tokens.splice(tokenIdx, 1, { chord: token.chord, lyric: before }, { chord, lyric: after })
  return newLines
}

/** Update or remove the chord on a specific token. Merges adjacent null-chord tokens. */
export function updateTokenChord(
  lines: VisualLine[],
  lineIdx: number,
  tokenIdx: number,
  chord: string | null
): VisualLine[] {
  const newLines = structuredClone(lines)
  const line = newLines[lineIdx]
  if (line.type !== "chord-lyric") return newLines

  line.tokens[tokenIdx] = { ...line.tokens[tokenIdx], chord }
  line.tokens = normalizeTokens(line.tokens)
  return newLines
}

/** Append a new chord-only token at the end of a line. */
export function appendChordToken(lines: VisualLine[], lineIdx: number, chord: string): VisualLine[] {
  const newLines = structuredClone(lines)
  const line = newLines[lineIdx]
  if (line.type !== "chord-lyric") return newLines

  // If last token has no chord, assign it; otherwise append new token
  const last = line.tokens[line.tokens.length - 1]
  if (last && last.chord === null && last.lyric === "") {
    last.chord = chord
  } else {
    line.tokens.push({ chord, lyric: "" })
  }
  return newLines
}

/** Insert a blank chord-lyric line after lineIdx. */
export function addLineAfter(lines: VisualLine[], afterIdx: number): VisualLine[] {
  const newLines = structuredClone(lines)
  newLines.splice(afterIdx + 1, 0, { type: "chord-lyric", tokens: [{ chord: null, lyric: "" }] })
  return newLines
}

/** Remove the line at idx. */
export function removeLine(lines: VisualLine[], idx: number): VisualLine[] {
  const newLines = structuredClone(lines)
  newLines.splice(idx, 1)
  return newLines.length > 0
    ? newLines
    : [{ type: "chord-lyric", tokens: [{ chord: null, lyric: "" }] }]
}

/** Merge consecutive tokens that both have null chords (no chord marker between them). */
function normalizeTokens(tokens: ChordToken[]): ChordToken[] {
  const result: ChordToken[] = []
  for (const token of tokens) {
    const prev = result[result.length - 1]
    if (prev && prev.chord === null && token.chord === null) {
      prev.lyric += token.lyric
    } else {
      result.push({ ...token })
    }
  }
  return result
}
