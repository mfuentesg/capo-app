import { convertToChordPro } from "@/features/lyrics-editor/utils/chordpro-converter"
import type { DraftSong } from "../../types"

function extractHtmlMeta(html: string, property: string): string | null {
  const match = html.match(new RegExp(`<meta[^>]+property="${property}"[^>]+content="([^"]*)"`, "i"))
  return match ? match[1] : null
}

export async function importFromCifraClub(url: URL): Promise<DraftSong> {
  const res = await fetch(url.href, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; Capo App)" }
  })
  if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`)

  const html = await res.text()

  // CifraClub embeds structured data as JSON-LD
  let title = ""
  let artist = ""
  const jsonLdMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)
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

  if (!title) title = extractHtmlMeta(html, "og:title") ?? ""

  // Extract chord+lyrics from the pre.cifra element
  const lyricsMatch = html.match(/<pre[^>]*class="cifra"[^>]*>([\s\S]*?)<\/pre>/)
  const rawLyrics = lyricsMatch ? lyricsMatch[1].replace(/<[^>]+>/g, "").trim() : ""

  const { output: lyrics } = convertToChordPro(rawLyrics)

  return { id: "", title, artist, key: "", bpm: 0, lyrics, isDraft: true }
}
