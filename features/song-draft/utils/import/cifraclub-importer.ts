import { convertToChordPro } from "@/features/lyrics-editor/utils/chordpro-converter"
import type { DraftSong } from "../../types"

const FETCH_TIMEOUT_MS = 15_000

// Static regexes — compiled once at module load.
const JSON_LD_RE = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/
// Matches <pre> elements whose class attribute contains the word "cifra"
// (handles extra classes like "cifra mt-4" or "g-cifra-single")
const CIFRA_PRE_RE = /<pre[^>]*\bclass="[^"]*\bcifra\b[^"]*"[^>]*>([\s\S]*?)<\/pre>/
const OG_TITLE_RE = /<meta[^>]+property="og:title"[^>]+content="([^"]*)"/i
const HTML_TAG_RE = /<[^>]+>/g

export async function importFromCifraClub(url: URL): Promise<DraftSong> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  let html: string
  try {
    const res = await fetch(url.href, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; Capo App)" },
      signal: controller.signal
    })
    if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`)
    html = await res.text()
  } finally {
    clearTimeout(timeout)
  }

  // CifraClub embeds structured data as JSON-LD
  let title = ""
  let artist = ""
  const jsonLdMatch = JSON_LD_RE.exec(html)
  if (jsonLdMatch) {
    try {
      const meta = JSON.parse(jsonLdMatch[1]) as Record<string, unknown>
      if (typeof meta.name === "string") title = meta.name
      const byArtist = meta.byArtist as Record<string, unknown> | undefined
      if (byArtist && typeof byArtist.name === "string") artist = byArtist.name
    } catch {
      // fall through to og:title fallback
    }
  }

  if (!title) title = OG_TITLE_RE.exec(html)?.[1] ?? ""

  // Extract chord+lyrics from the pre.cifra element (class may include extra classes)
  const lyricsMatch = CIFRA_PRE_RE.exec(html)
  const rawLyrics = lyricsMatch ? lyricsMatch[1].replace(HTML_TAG_RE, "").trim() : ""

  if (!rawLyrics) throw new Error("No chord content found on this CifraClub page")

  const { output: lyrics } = convertToChordPro(rawLyrics)

  return { id: "", title, artist, key: "", bpm: 0, lyrics, isDraft: true }
}
