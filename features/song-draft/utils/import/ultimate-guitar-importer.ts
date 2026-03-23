import { convertToChordPro } from "@/features/lyrics-editor/utils/chordpro-converter"
import type { DraftSong } from "../../types"

const FETCH_TIMEOUT_MS = 15_000

// Static regexes — compiled once at module load.
const UG_STATE_RE = /window\.UGAPP_STATE\s*=\s*(\{[\s\S]*?\});\s*<\/script>/
const UG_TAB_WRAPPER_RE = /\[tab\]|\[\/tab\]/gi
const UG_CHORD_TAG_RE = /\[ch\](.*?)\[\/ch\]/gi

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

  // Ultimate Guitar embeds all data in window.UGAPP_STATE
  const stateMatch = UG_STATE_RE.exec(html)
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
    .replace(UG_TAB_WRAPPER_RE, "")
    .replace(UG_CHORD_TAG_RE, "$1")
    .trim()

  if (!rawLyrics) throw new Error("No chord content found on this Ultimate Guitar page")

  const { output: lyrics } = convertToChordPro(rawLyrics)

  return { id: "", title, artist, key: "", bpm: 0, lyrics, isDraft: true }
}
