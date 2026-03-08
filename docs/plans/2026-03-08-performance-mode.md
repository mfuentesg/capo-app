# Performance / Presentation Mode — Implementation Plan

**Date:** 2026-03-08
**Status:** Pending

## Problem

Musicians on stage need a distraction-free, full-screen view of lyrics with large text and high contrast. The current lyrics view shows toolbars, sidebars, and editing controls that are unnecessary during live performance. Auto-scroll (#41) addresses movement, but the overall UI also needs a "stage mode".

## Approach

Add a "Performance Mode" toggle (keyboard shortcut `P` or a dedicated button) that:
1. Enters browser fullscreen (`document.requestFullscreen()`)
2. Hides all editing controls, toolbars, and sidebars
3. Increases font size significantly (configurable)
4. Applies a high-contrast theme (dark background, white text) optimized for stage lighting
5. Shows a minimal floating HUD with: song title, key, capo, auto-scroll toggle, and exit button

---

### Task 1: Create `usePerformanceMode` hook

**Files:**
- Create: `hooks/use-performance-mode.ts`

```typescript
import { useCallback, useEffect, useState } from "react"

export function usePerformanceMode() {
  const [isPerformanceMode, setIsPerformanceMode] = useState(false)

  const enter = useCallback(async () => {
    try {
      await document.documentElement.requestFullscreen()
    } catch {
      // Fullscreen not available (e.g. iframe) — still enter performance mode
    }
    setIsPerformanceMode(true)
  }, [])

  const exit = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {})
    }
    setIsPerformanceMode(false)
  }, [])

  const toggle = useCallback(() => (isPerformanceMode ? exit() : enter()), [
    isPerformanceMode,
    enter,
    exit
  ])

  // Exit performance mode when user presses Escape (fullscreen exit)
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isPerformanceMode) {
        setIsPerformanceMode(false)
      }
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [isPerformanceMode])

  // Keyboard shortcut: 'p' toggles performance mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)
        return
      if (e.key === "p" || e.key === "P") toggle()
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [toggle])

  return { isPerformanceMode, enter, exit, toggle }
}
```

---

### Task 2: Create `PerformanceModeView` component

**Files:**
- Create: `features/lyrics-editor/components/performance-mode-view.tsx`

```tsx
"use client"

import { useAutoScroll } from "@/hooks/use-auto-scroll"
import { RenderedSong } from "./rendered-song"
import { Button } from "@/components/ui/button"
import { X, Play, Pause } from "lucide-react"
import { useRef, useState } from "react"
import type { Song } from "@/features/songs"

interface PerformanceModeViewProps {
  song: Song
  transpose: number
  onExit: () => void
}

export function PerformanceModeView({ song, transpose, onExit }: PerformanceModeViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [fontSize, setFontSize] = useState(28)
  const defaultSpeed = song.bpm ? Math.round(song.bpm * 0.5) : 40
  const [speed, setSpeed] = useState(defaultSpeed)
  const { isScrolling, toggle: toggleScroll } = useAutoScroll({
    speed,
    containerRef: scrollRef
  })

  return (
    <div className="fixed inset-0 z-50 bg-black text-white flex flex-col">
      {/* Minimal HUD */}
      <div className="flex items-center justify-between px-6 py-3 bg-black/80 backdrop-blur">
        <div className="flex items-center gap-4">
          <span className="font-bold text-lg">{song.title}</span>
          {song.key && <span className="text-white/60 text-sm">Key: {song.key}</span>}
          {(song.capo ?? 0) > 0 && (
            <span className="text-white/60 text-sm">Capo: {song.capo}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Font size controls */}
          <Button size="sm" variant="ghost" className="text-white" onClick={() => setFontSize((f) => Math.max(16, f - 2))}>A−</Button>
          <Button size="sm" variant="ghost" className="text-white" onClick={() => setFontSize((f) => Math.min(60, f + 2))}>A+</Button>
          {/* Auto-scroll controls */}
          <Button size="sm" variant="ghost" className="text-white" onClick={() => setSpeed((s) => Math.max(10, s - 10))}>−</Button>
          <Button size="sm" variant={isScrolling ? "default" : "ghost"} className={isScrolling ? "" : "text-white"} onClick={toggleScroll}>
            {isScrolling ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button size="sm" variant="ghost" className="text-white" onClick={() => setSpeed((s) => Math.min(300, s + 10))}>+</Button>
          {/* Exit */}
          <Button size="sm" variant="ghost" className="text-white" onClick={onExit}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Lyrics */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-8 py-6">
        <RenderedSong
          song={song}
          transpose={transpose}
          columns={1}
          fontSize={fontSize}
          className="text-white [&_.chord]:text-yellow-300"
        />
      </div>
    </div>
  )
}
```

---

### Task 3: Integrate into `LyricsView`

**Files:**
- Modify: `features/lyrics-editor/components/lyrics-view.tsx`

```typescript
import { usePerformanceMode } from "@/hooks/use-performance-mode"
import { PerformanceModeView } from "./performance-mode-view"
import { MonitorPlay } from "lucide-react"

const { isPerformanceMode, toggle: togglePerformanceMode, exit: exitPerformanceMode } =
  usePerformanceMode()

// Render PerformanceModeView as an overlay when active
if (isPerformanceMode) {
  return (
    <PerformanceModeView
      song={song}
      transpose={effectiveSettings.transpose ?? 0}
      onExit={exitPerformanceMode}
    />
  )
}

// Add toggle button to toolbar:
<Button variant="ghost" size="icon" onClick={togglePerformanceMode} title="Performance mode (P)">
  <MonitorPlay className="h-4 w-4" />
</Button>
```

---

### Task 4: Integrate with playlist view

When a playlist is in "performance mode", show songs in sequence. Pressing the right arrow (or a "next song" button) advances to the next song in the playlist. Auto-scroll resets between songs.

**Files:**
- Modify: `features/playlists/components/playlist-detail.tsx`

Add a "Start performance" button that enters performance mode and shows the first song.

---

### Task 5: Tests

- Unit test `usePerformanceMode`: `enter()` calls `requestFullscreen`, sets `isPerformanceMode = true`
- Test `exit()` on `fullscreenchange` event when `document.fullscreenElement` becomes null
- Component smoke test: `PerformanceModeView` renders song title and lyrics

---

### Task 6: i18n

```json
{
  "lyricsView": {
    "performanceMode": "Performance mode",
    "exitPerformanceMode": "Exit performance mode"
  }
}
```

---

### Verification

```bash
pnpm lint && pnpm typecheck && pnpm test
```
