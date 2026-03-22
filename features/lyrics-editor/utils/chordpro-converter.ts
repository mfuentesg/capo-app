export type DetectedFormat = "chord-above-lyrics" | "plain-text" | "chordpro"

export interface ConversionResult {
  format: DetectedFormat
  output: string
}

/** Detect the most likely format of the input text */
export function detectFormat(text: string): DetectedFormat {
  if (/\[[A-G][^\]]*\]/.test(text)) return "chordpro"
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
