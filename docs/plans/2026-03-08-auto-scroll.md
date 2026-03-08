# Auto Scroll — Implementation Plan

**Date:** 2026-03-08
**GitHub Issue:** #41
**Status:** Pending

## Problem

During live performance, musicians need to read lyrics/chords while playing. Manually scrolling is impractical. The app should auto-scroll the lyrics view at a speed derived from the song's BPM so the performer can keep their eyes on the screen without touching it.

## Approach

Add a self-contained `useAutoScroll` hook that drives `requestAnimationFrame`-based scrolling at a configurable speed. Expose a toggle button and speed control in `LyricsView`. Default speed is derived from the song BPM (configurable multiplier). Works in both page mode and panel mode.

**Speed formula:** `px/s = bpm * scrollFactor` where `scrollFactor` defaults to `0.5` (adjustable via +/- controls).

---

### Task 1: Create `useAutoScroll` hook

**Files:**
- Create: `hooks/use-auto-scroll.ts`

```typescript
import { useCallback, useEffect, useRef, useState } from "react"

interface UseAutoScrollOptions {
  /** Pixels per second */
  speed: number
  containerRef: React.RefObject<HTMLElement>
}

export function useAutoScroll({ speed, containerRef }: UseAutoScrollOptions) {
  const [isScrolling, setIsScrolling] = useState(false)
  const rafRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number | null>(null)

  const stop = useCallback(() => {
    setIsScrolling(false)
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    lastTimeRef.current = null
  }, [])

  const start = useCallback(() => setIsScrolling(true), [])
  const toggle = useCallback(() => (isScrolling ? stop() : start()), [isScrolling, start, stop])

  useEffect(() => {
    if (!isScrolling) return

    const container = containerRef.current
    if (!container) return

    const tick = (timestamp: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = timestamp
      }
      const delta = (timestamp - lastTimeRef.current) / 1000
      lastTimeRef.current = timestamp

      const atBottom =
        container.scrollTop + container.clientHeight >= container.scrollHeight - 1
      if (atBottom) {
        stop()
        return
      }

      container.scrollTop += speed * delta
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [isScrolling, speed, containerRef, stop])

  // Stop when component unmounts
  useEffect(() => () => stop(), [stop])

  return { isScrolling, start, stop, toggle }
}
```

---

### Task 2: Add `AutoScrollControls` component

**Files:**
- Create: `features/lyrics-editor/components/auto-scroll-controls.tsx`

```tsx
import { Play, Pause, ChevronUp, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AutoScrollControlsProps {
  isScrolling: boolean
  speed: number
  onToggle: () => void
  onSpeedChange: (delta: number) => void
}

export function AutoScrollControls({
  isScrolling,
  speed,
  onToggle,
  onSpeedChange
}: AutoScrollControlsProps) {
  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onSpeedChange(-10)}
        title="Decrease scroll speed"
      >
        <ChevronDown className="h-4 w-4" />
      </Button>
      <Button
        variant={isScrolling ? "default" : "ghost"}
        size="sm"
        onClick={onToggle}
        title={isScrolling ? "Stop auto-scroll" : "Start auto-scroll"}
        className="gap-1"
      >
        {isScrolling ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
        <span className="tabular-nums text-xs">{speed}</span>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onSpeedChange(10)}
        title="Increase scroll speed"
      >
        <ChevronUp className="h-4 w-4" />
      </Button>
    </div>
  )
}
```

---

### Task 3: Integrate into `LyricsView`

**Files:**
- Modify: `features/lyrics-editor/components/lyrics-view.tsx`

**Step 1:** Import `useAutoScroll` and `AutoScrollControls`.

**Step 2:** Add scroll state using BPM as the default:

```typescript
const scrollContainerRef = useRef<HTMLDivElement>(null)
const [scrollSpeed, setScrollSpeed] = useState(() =>
  song.bpm ? Math.round(song.bpm * 0.5) : 40
)

const { isScrolling, toggle } = useAutoScroll({
  speed: scrollSpeed,
  containerRef: scrollContainerRef
})

const handleSpeedChange = (delta: number) => {
  setScrollSpeed((prev) => Math.max(10, Math.min(300, prev + delta)))
}
```

**Step 3:** Attach `scrollContainerRef` to the rendered-lyrics scroll container (the element that overflows vertically in the preview pane).

**Step 4:** Add `<AutoScrollControls>` to the lyrics view toolbar alongside the existing settings controls.

---

### Task 4: Write tests for `useAutoScroll`

**Files:**
- Create: `hooks/__tests__/use-auto-scroll.test.ts`

Test cases:
- `isScrolling` starts as `false`
- `toggle()` sets `isScrolling` to `true`
- `stop()` sets `isScrolling` to `false`
- Scrolls the container on each RAF tick (mock `requestAnimationFrame`)
- Stops automatically when container is scrolled to bottom

---

### Task 5: i18n

Add translation keys:

```json
{
  "lyricsView": {
    "autoScroll": {
      "start": "Start auto-scroll",
      "stop": "Stop auto-scroll",
      "speed": "Speed"
    }
  }
}
```

Files: `lib/i18n/locales/en.json`, `lib/i18n/locales/es.json`

---

### Verification

```bash
pnpm lint && pnpm typecheck && pnpm test
```
