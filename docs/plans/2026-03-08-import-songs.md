# Import Songs from External Platforms — Implementation Plan

**Date:** 2026-03-08
**GitHub Issue:** #39
**Status:** Pending

## Problem

Users who already have song libraries on platforms like CifraClub, Ultimate Guitar, or LaCuerda need to manually re-enter their songs. Given just a URL, the app should scrape/fetch the song data and auto-populate the song creation form.

## Approach

Create a server-side import pipeline. The user pastes a URL into an "Import from URL" dialog. A Next.js server action detects the platform, fetches + parses the page (via `fetch` on the server), and returns a `DraftSong` object. The user reviews it in the normal `SongDraftForm` before saving.

**Supported platforms (v1):**
- [CifraClub](https://www.cifraclub.com.br) — ChordPro-like HTML structure
- [Ultimate Guitar](https://www.ultimate-guitar.com) — JSON embedded in `window.UGAPP_STATE`
- [LaCuerda](https://www.lacuerda.net) — HTML chord+lyrics structure

---

### Task 1: Create the import server action

**Files:**
- Create: `features/song-draft/api/import-actions.ts`

```typescript
"use server"

import { DraftSong } from "../types"
import { detectPlatform } from "../utils/import/platform-detector"
import { importFromCifraClub } from "../utils/import/cifraclub-importer"
import { importFromUltimateGuitar } from "../utils/import/ultimate-guitar-importer"

export async function importSongFromUrl(url: string): Promise<DraftSong> {
  let parsedUrl: URL
  try {
    parsedUrl = new URL(url)
  } catch {
    throw new Error("Invalid URL")
  }

  const platform = detectPlatform(parsedUrl)

  switch (platform) {
    case "cifraclub":
      return importFromCifraClub(parsedUrl)
    case "ultimate-guitar":
      return importFromUltimateGuitar(parsedUrl)
    default:
      throw new Error(`Unsupported platform: ${parsedUrl.hostname}`)
  }
}
```

---

### Task 2: Platform detector

**Files:**
- Create: `features/song-draft/utils/import/platform-detector.ts`

```typescript
export type SupportedPlatform = "cifraclub" | "ultimate-guitar" | "lacuerda" | "unknown"

export function detectPlatform(url: URL): SupportedPlatform {
  const host = url.hostname.replace(/^www\./, "")
  if (host === "cifraclub.com.br") return "cifraclub"
  if (host === "ultimate-guitar.com" || host === "tabs.ultimate-guitar.com") return "ultimate-guitar"
  if (host === "lacuerda.net") return "lacuerda"
  return "unknown"
}
```

---

### Task 3: Platform importers

**Files:**
- Create: `features/song-draft/utils/import/cifraclub-importer.ts`
- Create: `features/song-draft/utils/import/ultimate-guitar-importer.ts`

Each importer:
1. `fetch(url.href)` the HTML
2. Parse it (using regex or a minimal DOM-like approach — no `jsdom` on edge; use `cheerio` if needed)
3. Extract title, artist, key, BPM (if available), and chord+lyrics content
4. Convert to ChordPro format via the `convertToChordPro` utility
5. Return a `DraftSong` object

**CifraClub example:**

```typescript
export async function importFromCifraClub(url: URL): Promise<DraftSong> {
  const res = await fetch(url.href, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; Capo App)" }
  })
  if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`)

  const html = await res.text()

  // CifraClub embeds structured data as JSON-LD
  const jsonLdMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)
  const meta = jsonLdMatch ? JSON.parse(jsonLdMatch[1]) : {}

  const title = meta.name ?? extractHtmlMeta(html, "og:title") ?? ""
  const artist = meta.byArtist?.name ?? ""

  // Extract chord+lyrics from the pre.cifra element
  const lyricsMatch = html.match(/<pre[^>]*class="cifra"[^>]*>([\s\S]*?)<\/pre>/)
  const rawLyrics = lyricsMatch
    ? lyricsMatch[1].replace(/<[^>]+>/g, "").trim()
    : ""

  const { output: lyrics } = convertToChordPro(rawLyrics)

  return { title, artist, lyrics, isDraft: false }
}
```

---

### Task 4: Add "Import from URL" dialog

**Files:**
- Create: `features/song-draft/components/import-url-dialog.tsx`

```tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { importSongFromUrl } from "../api/import-actions"
import type { DraftSong } from "../types"

interface ImportUrlDialogProps {
  open: boolean
  onClose: () => void
  onImported: (song: DraftSong) => void
}

export function ImportUrlDialog({ open, onClose, onImported }: ImportUrlDialogProps) {
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleImport = async () => {
    setLoading(true)
    setError(null)
    try {
      const song = await importSongFromUrl(url)
      onImported(song)
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import song from URL</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Paste a URL from CifraClub or Ultimate Guitar.
        </p>
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.cifraclub.com.br/…"
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button disabled={!url || loading} onClick={handleImport}>
            {loading ? "Importing…" : "Import"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

---

### Task 5: Wire up to song creation flow

**Files:**
- Modify: `features/songs/components/songs-client.tsx`

Add an "Import from URL" button next to the "New song" button. When import completes, pre-fill the `SongDraftForm` with the returned `DraftSong` data.

---

### Task 6: Tests

- Unit test `detectPlatform`: verify hostname matching
- Unit test `convertToChordPro` with sample CifraClub HTML
- Mock `fetch` in importer tests to avoid network calls

---

### Task 7: Rate limiting & error handling

Wrap the server action with rate limiting per user (max 10 imports/hour) using a simple counter in Supabase or in-memory (Vercel Edge Config). Show a friendly error message for unsupported platforms.

---

### Verification

```bash
pnpm lint && pnpm typecheck && pnpm test
```
