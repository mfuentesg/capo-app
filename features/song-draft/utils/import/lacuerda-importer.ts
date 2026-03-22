import { convertToChordPro } from "@/features/lyrics-editor/utils/chordpro-converter"
import type { ImportedSong } from "./types"

function extractMetaContent(html: string, name: string): string | undefined {
  const match = html.match(new RegExp(`<meta[^>]+name="${name}"[^>]+content="([^"]*)"`, "i"))
  return match?.[1]
}

function stripHtml(html: string): string {
  return html
    .replace(/<b>([^<]*)<\/b>/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .trim()
}

export async function importFromLaCuerda(url: URL): Promise<ImportedSong> {
  const res = await fetch(url.href, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; Capo/1.0)" },
  })
  if (!res.ok) throw new Error(`Failed to fetch LaCuerda page: ${res.status}`)

  const html = await res.text()

  // LaCuerda uses <meta name="title"> and <meta name="artist">
  const title = extractMetaContent(html, "title") ?? ""
  const artist = extractMetaContent(html, "artist") ?? ""

  // Chord+lyrics are inside <pre class="tab"> or similar <pre> block
  const preMatch = html.match(/<pre[^>]*>([\s\S]*?)<\/pre>/)
  const rawLyrics = preMatch ? stripHtml(preMatch[1]) : ""

  const { output: lyrics } = convertToChordPro(rawLyrics)

  return { title, artist, lyrics }
}
