import { convertToChordPro } from "@/features/lyrics-editor/utils/chordpro-converter"
import type { ImportedSong } from "./types"

function extractMetaContent(html: string, property: string): string | undefined {
  const match = html.match(new RegExp(`<meta[^>]+property="${property}"[^>]+content="([^"]*)"`, "i"))
  return match?.[1]
}

function stripHtml(html: string): string {
  return html
    .replace(/<b>([^<]*)<\/b>/g, "$1") // bold chord names — keep text
    .replace(/<[^>]+>/g, "") // remove remaining tags
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .trim()
}

export async function importFromCifraClub(url: URL): Promise<ImportedSong> {
  const res = await fetch(url.href, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; Capo/1.0)" },
  })
  if (!res.ok) throw new Error(`Failed to fetch CifraClub page: ${res.status}`)

  const html = await res.text()

  // JSON-LD structured data
  const jsonLdMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)
  let meta: Record<string, unknown> = {}
  if (jsonLdMatch) {
    try {
      meta = JSON.parse(jsonLdMatch[1]) as Record<string, unknown>
    } catch {
      // ignore parse errors
    }
  }

  const title =
    (meta.name as string | undefined) ??
    extractMetaContent(html, "og:title") ??
    ""
  const artistMeta = meta.byArtist as { name?: string } | undefined
  const artist = artistMeta?.name ?? ""

  // Chord+lyrics live inside <pre class="cifra"> or <div class="cifra_cnt">
  const preMatch = html.match(/<pre[^>]*class="[^"]*cifra[^"]*"[^>]*>([\s\S]*?)<\/pre>/)
  const rawLyrics = preMatch ? stripHtml(preMatch[1]) : ""

  const { output: lyrics } = convertToChordPro(rawLyrics)

  return { title, artist, lyrics }
}
