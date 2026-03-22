import { convertToChordPro } from "@/features/lyrics-editor/utils/chordpro-converter"
import type { DraftSong } from "../../types"

interface UgTab {
  song_name?: string
  artist_name?: string
  content?: string
}

interface UgAppState {
  store?: {
    page?: {
      data?: {
        tab?: UgTab
        tab_view?: {
          wiki_tab?: {
            content?: string
          }
        }
      }
    }
  }
}

export async function importFromUltimateGuitar(url: URL): Promise<DraftSong> {
  const res = await fetch(url.href, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; Capo App)" }
  })
  if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`)

  const html = await res.text()

  // Ultimate Guitar embeds all data in window.UGAPP_STATE
  const stateMatch = html.match(/window\.UGAPP_STATE\s*=\s*(\{[\s\S]*?\});\s*<\/script>/)
  if (!stateMatch) throw new Error("Could not parse Ultimate Guitar page data")

  let appState: UgAppState
  try {
    appState = JSON.parse(stateMatch[1]) as UgAppState
  } catch {
    throw new Error("Could not parse Ultimate Guitar page data")
  }

  const tab = appState.store?.page?.data?.tab
  const tabView = appState.store?.page?.data?.tab_view

  const title = tab?.song_name ?? ""
  const artist = tab?.artist_name ?? ""

  // Content may be in tab.content or tab_view.wiki_tab.content
  const rawContent = tabView?.wiki_tab?.content ?? tab?.content ?? ""

  // UG uses [tab]...[/tab] and [ch]chord[/ch] markers — strip UG-specific tags
  const rawLyrics = rawContent
    .replace(/\[tab\]|\[\/tab\]/gi, "")
    .replace(/\[ch\](.*?)\[\/ch\]/gi, "$1")
    .trim()

  const { output: lyrics } = convertToChordPro(rawLyrics)

  return { id: "", title, artist, key: "", bpm: 0, lyrics, isDraft: true }
}
