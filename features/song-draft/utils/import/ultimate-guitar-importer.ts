import { convertToChordPro } from "@/features/lyrics-editor/utils/chordpro-converter"
import type { ImportedSong } from "./types"

interface UgAppState {
  store?: {
    page?: {
      data?: {
        tab?: {
          song_name?: string
          artist_name?: string
          content?: string
          tonality_name?: string
          bpm?: number
        }
      }
    }
  }
}

function parseUgAppState(html: string): UgAppState | null {
  const match = html.match(/window\.UGAPP_STATE\s*=\s*(\{[\s\S]*?\});\s*<\/script>/)
  if (!match) return null
  try {
    return JSON.parse(match[1]) as UgAppState
  } catch {
    return null
  }
}

function decodeUgContent(content: string): string {
  // UG encodes content as HTML entities inside a JSON string
  return content
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "")
    .replace(/\\t/g, "  ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    // Strip UG-specific markup like [ch]G[/ch] → [G] and [tab]...[/tab]
    .replace(/\[ch\]([^\[]*)\[\/ch\]/g, "[$1]")
    .replace(/\[tab\]([\s\S]*?)\[\/tab\]/g, "$1")
    .trim()
}

export async function importFromUltimateGuitar(url: URL): Promise<ImportedSong> {
  const res = await fetch(url.href, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; Capo/1.0)" },
  })
  if (!res.ok) throw new Error(`Failed to fetch Ultimate Guitar page: ${res.status}`)

  const html = await res.text()
  const state = parseUgAppState(html)
  const tab = state?.store?.page?.data?.tab

  if (!tab) throw new Error("Could not parse song data from Ultimate Guitar page")

  const title = tab.song_name ?? ""
  const artist = tab.artist_name ?? ""
  const rawContent = tab.content ? decodeUgContent(tab.content) : ""

  // UG tabs already use [chord] inline notation — run through converter to normalise
  const { output: lyrics } = convertToChordPro(rawContent)

  const result: ImportedSong = { title, artist, lyrics }
  if (tab.tonality_name) result.key = tab.tonality_name
  if (tab.bpm) result.bpm = tab.bpm

  return result
}
