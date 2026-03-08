# PDF / Print Export — Implementation Plan

**Date:** 2026-03-08
**Status:** Pending

## Problem

Musicians frequently need printed setlists and song sheets for rehearsals and live performances. The app has no way to export songs or playlists to a formatted PDF. Browser print is an option but produces inconsistent results without print-specific styles.

## Approach

Use the browser's `window.print()` with dedicated `@media print` CSS. For clean PDFs, render a hidden `PrintView` component with specific print styles (no sidebar, no toolbar, formatted lyrics), then trigger print. For server-generated PDFs (better formatting control), use a Puppeteer-based Vercel serverless function (optional v2).

**V1 (client-side print):**
- A `PrintLayout` wrapper component with print-optimized styles
- A "Print / Export PDF" button in `SongDetail` and `PlaylistDetail`
- CSS `@media print` rules that hide everything except the print layout

**V2 (server-side PDF):**
- A `/api/pdf/song/[id]` route using `@react-pdf/renderer` or Puppeteer (deferred)

---

### Task 1: Create `PrintSongView` component

**Files:**
- Create: `features/songs/components/print-song-view.tsx`

```tsx
import { RenderedSong } from "@/features/lyrics-editor"
import type { Song, UserSongSettings } from "@/features/songs"

interface PrintSongViewProps {
  song: Song
  settings?: UserSongSettings | null
}

export function PrintSongView({ song, settings }: PrintSongViewProps) {
  const capo = settings?.capo ?? song.capo ?? 0
  const transpose = settings?.transpose ?? song.transpose ?? 0

  return (
    <div className="print-song-view">
      <h1 className="print-title">{song.title}</h1>
      {song.artist && <h2 className="print-artist">{song.artist}</h2>}
      <div className="print-meta">
        {song.key && <span>Key: {song.key}</span>}
        {capo > 0 && <span>Capo: {capo}</span>}
        {song.bpm && <span>BPM: {song.bpm}</span>}
      </div>
      <RenderedSong
        song={song}
        transpose={transpose}
        columns={1}
        fontSize={song.fontSize ?? 14}
      />
    </div>
  )
}
```

---

### Task 2: Add print styles

**Files:**
- Modify: `app/globals.css`

```css
@media print {
  /* Hide everything except the print view */
  body > * {
    display: none !important;
  }

  .print-root {
    display: block !important;
  }

  .print-song-view {
    font-family: Georgia, serif;
    max-width: 100%;
    padding: 0;
  }

  .print-title {
    font-size: 24pt;
    font-weight: bold;
    margin-bottom: 4pt;
  }

  .print-artist {
    font-size: 14pt;
    color: #555;
    margin-bottom: 8pt;
  }

  .print-meta {
    font-size: 10pt;
    color: #777;
    margin-bottom: 16pt;
    display: flex;
    gap: 16pt;
  }

  /* Avoid page breaks inside lyric blocks */
  .chord-line,
  .lyric-block {
    break-inside: avoid;
  }
}
```

---

### Task 3: Create `usePrint` hook

**Files:**
- Create: `hooks/use-print.ts`

```typescript
import { useCallback, useRef } from "react"

export function usePrint() {
  const printRef = useRef<HTMLDivElement>(null)

  const print = useCallback(() => {
    if (!printRef.current) return
    printRef.current.classList.add("print-root")
    window.print()
    // Clean up after print dialog closes
    const cleanup = () => {
      printRef.current?.classList.remove("print-root")
      window.removeEventListener("afterprint", cleanup)
    }
    window.addEventListener("afterprint", cleanup)
  }, [])

  return { printRef, print }
}
```

---

### Task 4: Add print button to `SongDetail` and `LyricsView`

**Files:**
- Modify: `features/songs/components/song-detail.tsx`
- Modify: `features/lyrics-editor/components/lyrics-view.tsx`

```tsx
import { usePrint } from "@/hooks/use-print"
import { PrintSongView } from "../print-song-view"
import { Printer } from "lucide-react"

// In the component:
const { printRef, print } = usePrint()

// In JSX (hidden from screen, shown in print):
<div ref={printRef} className="hidden">
  <PrintSongView song={song} settings={effectiveSettings} />
</div>

// Button:
<Button variant="ghost" size="icon" onClick={print} title="Print / Export PDF">
  <Printer className="h-4 w-4" />
</Button>
```

---

### Task 5: Playlist print view

**Files:**
- Create: `features/playlists/components/print-playlist-view.tsx`

Renders all songs in a playlist sequentially, each starting after the previous. Page breaks between songs via `page-break-after: always` in print CSS.

Add a "Print all" button to `PlaylistDetail`.

---

### Task 6: Tests

- Unit test `usePrint`: calling `print()` adds `.print-root` to the ref element
- Visual smoke test: render `PrintSongView` and verify it contains title, artist, and lyrics

---

### Task 7: i18n

```json
{
  "song": { "print": "Print / Export PDF" },
  "playlist": { "printAll": "Print all songs" }
}
```

---

### Verification

```bash
pnpm lint && pnpm typecheck && pnpm test
```
