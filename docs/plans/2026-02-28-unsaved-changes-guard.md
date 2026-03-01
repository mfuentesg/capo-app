# Unsaved Changes Guard Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Prevent users from accidentally losing unsaved work in `SongDraftForm` and `LyricsView` when swiping a Drawer closed, pressing Escape, browser back/forward, or refreshing the page.

**Architecture:** A shared `useUnsavedChangesGuard` hook manages `beforeunload` (browser close/reload) and `popstate` (back/forward) events. It returns `{ showPrompt, triggerClose, confirmDiscard, keepEditing }`. `SongDraftForm` is wrapped in `forwardRef` and exposes `requestClose()` via `useImperativeHandle` so `SongsClient` can delegate Drawer close attempts to the form's own dirty check. `LyricsView` replaces `window.confirm` with the hook's in-app prompt.

**Tech Stack:** React 18 (`forwardRef`, `useImperativeHandle`, `useCallback`, `useEffect`, `useState`), `@testing-library/react` (`renderHook`, `act`), Jest

---

## Task 1: Create `hooks/use-unsaved-changes-guard.ts`

**Files:**
- Create: `hooks/use-unsaved-changes-guard.ts`
- Create: `hooks/__tests__/use-unsaved-changes-guard.test.ts`

### Step 1: Write the failing tests

Create `hooks/__tests__/use-unsaved-changes-guard.test.ts`:

```ts
import { renderHook, act } from "@testing-library/react"
import { useUnsavedChangesGuard } from "../use-unsaved-changes-guard"

describe("useUnsavedChangesGuard", () => {
  let addEventSpy: jest.SpyInstance
  let removeEventSpy: jest.SpyInstance
  let pushStateSpy: jest.SpyInstance

  beforeEach(() => {
    addEventSpy = jest.spyOn(window, "addEventListener")
    removeEventSpy = jest.spyOn(window, "removeEventListener")
    pushStateSpy = jest.spyOn(window.history, "pushState").mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it("does not register event listeners when not dirty", () => {
    renderHook(() => useUnsavedChangesGuard(false, { onDiscard: jest.fn() }))
    expect(addEventSpy).not.toHaveBeenCalledWith("beforeunload", expect.any(Function))
    expect(addEventSpy).not.toHaveBeenCalledWith("popstate", expect.any(Function))
  })

  it("registers beforeunload and popstate listeners when dirty", () => {
    renderHook(() => useUnsavedChangesGuard(true, { onDiscard: jest.fn() }))
    expect(addEventSpy).toHaveBeenCalledWith("beforeunload", expect.any(Function))
    expect(addEventSpy).toHaveBeenCalledWith("popstate", expect.any(Function))
    expect(pushStateSpy).toHaveBeenCalledWith(null, "", window.location.href)
  })

  it("removes listeners on cleanup when dirty becomes false", () => {
    const { rerender } = renderHook(
      ({ dirty }: { dirty: boolean }) =>
        useUnsavedChangesGuard(dirty, { onDiscard: jest.fn() }),
      { initialProps: { dirty: true } }
    )
    rerender({ dirty: false })
    expect(removeEventSpy).toHaveBeenCalledWith("beforeunload", expect.any(Function))
    expect(removeEventSpy).toHaveBeenCalledWith("popstate", expect.any(Function))
  })

  it("triggerClose shows prompt when dirty", () => {
    const { result } = renderHook(() =>
      useUnsavedChangesGuard(true, { onDiscard: jest.fn() })
    )
    act(() => { result.current.triggerClose() })
    expect(result.current.showPrompt).toBe(true)
  })

  it("triggerClose calls onDiscard immediately when not dirty", () => {
    const onDiscard = jest.fn()
    const { result } = renderHook(() =>
      useUnsavedChangesGuard(false, { onDiscard })
    )
    act(() => { result.current.triggerClose() })
    expect(result.current.showPrompt).toBe(false)
    expect(onDiscard).toHaveBeenCalledTimes(1)
  })

  it("confirmDiscard hides prompt and calls onDiscard", () => {
    const onDiscard = jest.fn()
    const { result } = renderHook(() =>
      useUnsavedChangesGuard(true, { onDiscard })
    )
    act(() => { result.current.triggerClose() })
    expect(result.current.showPrompt).toBe(true)
    act(() => { result.current.confirmDiscard() })
    expect(result.current.showPrompt).toBe(false)
    expect(onDiscard).toHaveBeenCalledTimes(1)
  })

  it("keepEditing hides prompt without calling onDiscard", () => {
    const onDiscard = jest.fn()
    const { result } = renderHook(() =>
      useUnsavedChangesGuard(true, { onDiscard })
    )
    act(() => { result.current.triggerClose() })
    act(() => { result.current.keepEditing() })
    expect(result.current.showPrompt).toBe(false)
    expect(onDiscard).not.toHaveBeenCalled()
  })

  it("popstate handler shows prompt and re-pushes history when dirty", () => {
    renderHook(() => useUnsavedChangesGuard(true, { onDiscard: jest.fn() }))
    // Simulate browser back — fire popstate
    act(() => { window.dispatchEvent(new PopStateEvent("popstate")) })
    // Should re-push state to prevent navigation
    expect(pushStateSpy).toHaveBeenCalledTimes(2) // once on mount, once on popstate
  })
})
```

### Step 2: Run to verify it fails

```bash
pnpm test -- --testPathPattern=hooks/__tests__/use-unsaved-changes-guard
```

Expected: FAIL — `Cannot find module '../use-unsaved-changes-guard'`

### Step 3: Implement the hook

Create `hooks/use-unsaved-changes-guard.ts`:

```ts
"use client"

import { useState, useEffect, useCallback } from "react"

interface UseUnsavedChangesGuardOptions {
  onDiscard: () => void
}

export function useUnsavedChangesGuard(
  isDirty: boolean,
  { onDiscard }: UseUnsavedChangesGuardOptions
) {
  const [showPrompt, setShowPrompt] = useState(false)

  // Prevent browser close / page reload
  useEffect(() => {
    if (!isDirty) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
    }
    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [isDirty])

  // Prevent browser back / forward
  useEffect(() => {
    if (!isDirty) return
    // Push a guard history entry so the next "back" pops this guard, not the real page
    window.history.pushState(null, "", window.location.href)
    const handler = () => {
      // Re-push to prevent actual navigation
      window.history.pushState(null, "", window.location.href)
      setShowPrompt(true)
    }
    window.addEventListener("popstate", handler)
    return () => window.removeEventListener("popstate", handler)
  }, [isDirty])

  const triggerClose = useCallback(() => {
    if (isDirty) {
      setShowPrompt(true)
    } else {
      onDiscard()
    }
  }, [isDirty, onDiscard])

  const confirmDiscard = useCallback(() => {
    setShowPrompt(false)
    onDiscard()
  }, [onDiscard])

  const keepEditing = useCallback(() => {
    setShowPrompt(false)
  }, [])

  return { showPrompt, triggerClose, confirmDiscard, keepEditing }
}
```

### Step 4: Run tests to verify they pass

```bash
pnpm test -- --testPathPattern=hooks/__tests__/use-unsaved-changes-guard
```

Expected: All 8 tests PASS

### Step 5: Commit

```bash
git add hooks/use-unsaved-changes-guard.ts hooks/__tests__/use-unsaved-changes-guard.test.ts
git commit -m "feat: add useUnsavedChangesGuard hook"
```

---

## Task 2: Update `SongDraftForm`

**Files:**
- Modify: `features/song-draft/components/song-draft-form.tsx`

### Step 1: Read the current file

Read `features/song-draft/components/song-draft-form.tsx` — understand the full component before touching it.

### Step 2: Apply the changes

Replace the entire file with the updated version. Key changes:

1. Add imports: `forwardRef`, `useImperativeHandle`, `useRef` from `react`; `useUnsavedChangesGuard` from `@/hooks/use-unsaved-changes-guard`
2. Define `SongDraftFormHandle` interface above the component:
   ```ts
   export interface SongDraftFormHandle {
     requestClose: () => void
   }
   ```
3. Wrap the component in `forwardRef<SongDraftFormHandle, SongDraftFormProps>`:
   ```ts
   export const SongDraftForm = forwardRef<SongDraftFormHandle, SongDraftFormProps>(
     function SongDraftForm({ song, onClose, onSave, onChange }, ref) {
   ```
4. Replace manual `showUnsavedPrompt` state + `handleCancelClick` with the hook:
   ```ts
   // Remove: const [showUnsavedPrompt, setShowUnsavedPrompt] = useState(false)

   const confirmClose = useCallback(() => {
     onClose()
     form.reset()
   }, [onClose, form])

   const { showPrompt, triggerClose, confirmDiscard, keepEditing } =
     useUnsavedChangesGuard(isDirty, { onDiscard: confirmClose })
   ```
5. Expose `requestClose` via `useImperativeHandle`:
   ```ts
   useImperativeHandle(ref, () => ({ requestClose: triggerClose }))
   ```
6. In JSX: replace `handleCancelClick` with `triggerClose` on the X button and Cancel button; replace `showUnsavedPrompt` with `showPrompt`; replace `setShowUnsavedPrompt(false)` with `keepEditing`; replace `confirmClose` in the Discard button with `confirmDiscard`

The unsaved prompt block (lines 237–253 in the original) keeps the same UI; only the state variable names change:

```tsx
{showPrompt && (
  <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4 mt-6">
    <p className="text-sm font-medium mb-3">{t.common.unsavedChanges}</p>
    <p className="text-sm text-muted-foreground mb-4">{t.common.discardChangesMessage}</p>
    <div className="flex gap-3 justify-end">
      <Button variant="outline" size="sm" onClick={keepEditing}>
        {t.common.keepEditing}
      </Button>
      <Button variant="destructive" size="sm" onClick={confirmDiscard}>
        {t.common.discard}
      </Button>
    </div>
  </div>
)}
```

### Step 3: Typecheck

```bash
pnpm typecheck
```

Expected: No errors

### Step 4: Commit

```bash
git add features/song-draft/components/song-draft-form.tsx
git commit -m "feat: wire useUnsavedChangesGuard into SongDraftForm"
```

---

## Task 3: Update `SongsClient` — intercept Drawer close

**Files:**
- Modify: `features/songs/components/songs-client.tsx`

### Step 1: Read the current file

Read `features/songs/components/songs-client.tsx` — focus on the Drawer section (~lines 412–450) and where `SongDraftForm` is rendered.

### Step 2: Apply the changes

Three targeted changes:

1. **Import** `SongDraftFormHandle` and `useRef`:
   ```ts
   import { useState, useEffect, useMemo, useRef } from "react"
   import { SongDraftForm, type SongDraftFormHandle } from "@/features/song-draft"
   ```

2. **Add ref** in the component body (next to other state):
   ```ts
   const songDraftFormRef = useRef<SongDraftFormHandle>(null)
   ```

3. **Fix the Drawer `onOpenChange`** to delegate to the form's dirty check instead of closing directly:
   ```tsx
   <Drawer
     open={isMobileDrawerOpen}
     onOpenChange={(open) => {
       if (!open && isCreatingNewSong) {
         songDraftFormRef.current?.requestClose()
         // Don't close — the form will call onClose() after user confirms
       } else if (!open) {
         handleCloseSongDetail()
       }
     }}
   >
   ```

4. **Pass the ref** to both `SongDraftForm` instances (desktop panel and mobile Drawer):
   ```tsx
   <SongDraftForm
     ref={songDraftFormRef}
     song={previewSong || undefined}
     onClose={...}
     onSave={handleSaveSong}
     onChange={handleUpdatePreview}
   />
   ```
   Apply this to both occurrences (line ~381 and ~433).

### Step 3: Typecheck

```bash
pnpm typecheck
```

Expected: No errors

### Step 4: Commit

```bash
git add features/songs/components/songs-client.tsx
git commit -m "feat: intercept Drawer close via SongDraftForm.requestClose"
```

---

## Task 4: Update `LyricsView`

**Files:**
- Modify: `features/lyrics-editor/components/lyrics-view.tsx`

### Step 1: Read the current file

Read `features/lyrics-editor/components/lyrics-view.tsx` in full — understand `hasUnsavedChanges`, `handleCancel`, `handleBack`, and the Save button JSX.

### Step 2: Apply the changes

Key changes:

1. **Add import**:
   ```ts
   import { useUnsavedChangesGuard } from "@/hooks/use-unsaved-changes-guard"
   ```

2. **Remove** `const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)` — the hook will own `showPrompt` instead.

3. **Keep** `hasUnsavedChanges` as a derived local boolean (still needed for the "Unsaved changes" badge and Save button disabled state):
   ```ts
   const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
   ```
   Actually keep the state — the hook needs `isDirty` which equals `hasUnsavedChanges`. The hook's `showPrompt` replaces the `confirm()` dialog.

4. **Add the hook** after the existing `hasUnsavedChanges` state:
   ```ts
   const handleDiscard = useCallback(() => {
     setIsEditing(false)
     setIsPreviewing(false)
     setEditedLyrics(savedLyrics)
     setHasUnsavedChanges(false)
     if (onClose) {
       onClose()
     } else {
       router.back()
     }
   }, [savedLyrics, onClose, router])

   const { showPrompt, triggerClose, confirmDiscard, keepEditing } =
     useUnsavedChangesGuard(hasUnsavedChanges, { onDiscard: handleDiscard })
   ```

5. **Replace `handleCancel`**:
   ```ts
   // Before:
   const handleCancel = () => {
     if (hasUnsavedChanges) {
       if (confirm(t.common.discardChangesMessage)) { ... }
     } else { ... }
   }

   // After:
   const handleCancel = useCallback(() => {
     if (hasUnsavedChanges) {
       triggerClose()
     } else {
       setIsEditing(false)
       setIsPreviewing(false)
     }
   }, [hasUnsavedChanges, triggerClose])
   ```

6. **Replace `handleBack`**:
   ```ts
   // Before:
   const handleBack = () => {
     if (onClose) { onClose(); return }
     router.back()
   }

   // After:
   const handleBack = useCallback(() => {
     if (hasUnsavedChanges) {
       triggerClose()
     } else if (onClose) {
       onClose()
     } else {
       router.back()
     }
   }, [hasUnsavedChanges, triggerClose, onClose, router])
   ```

7. **Add the in-app prompt** in JSX. Place it just before the closing `</div>` of the header section, right after the editing actions block (around line 175):
   ```tsx
   {showPrompt && (
     <div className="mt-4 pt-4 border-t">
       <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
         <p className="text-sm font-medium mb-3">{t.common.unsavedChanges}</p>
         <p className="text-sm text-muted-foreground mb-4">{t.common.discardChangesMessage}</p>
         <div className="flex gap-3 justify-end">
           <Button variant="outline" size="sm" onClick={keepEditing}>
             {t.common.keepEditing}
           </Button>
           <Button variant="destructive" size="sm" onClick={confirmDiscard}>
             {t.common.discard}
           </Button>
         </div>
       </div>
     </div>
   )}
   ```

### Step 3: Typecheck + lint

```bash
pnpm typecheck && pnpm lint
```

Expected: No errors

### Step 4: Commit

```bash
git add features/lyrics-editor/components/lyrics-view.tsx
git commit -m "feat: replace window.confirm with useUnsavedChangesGuard in LyricsView"
```

---

## Task 5: Final verification

### Step 1: Run all tests

```bash
pnpm test
```

Expected: All tests pass, coverage thresholds met

### Step 2: Manual smoke test

1. Go to `/dashboard/songs` → click "Add Song" → type a title → swipe the Drawer (mobile) or press Escape → expect unsaved prompt
2. Same with browser back button → expect prompt
3. Refresh page while form is dirty → browser shows "Leave site?" dialog
4. Go to `/dashboard/songs/[id]` → edit lyrics → click back arrow → expect in-app prompt
5. Go to `/dashboard/playlists` → open a song → edit lyrics → click X → expect in-app prompt

### Step 3: Commit any test fixes, then push

```bash
git add -p
git commit -m "test: ensure unsaved-changes-guard tests pass"
```
