# Unsaved Changes Guard — Design

**Date:** 2026-02-28
**Status:** Approved

## Problem

Two editors can lose user work without warning:

1. **`SongDraftForm`** (create new song, `/dashboard/songs`): rendered in a ResizablePanel (desktop) or Vaul Drawer (mobile). The X/Cancel buttons already check `isDirty`, but Drawer swipe-to-close, Escape, browser back/forward, and page reload bypass the check.

2. **`LyricsView`** (edit lyrics, `/dashboard/songs/[id]` and as a panel in playlists): Cancel button uses native `window.confirm`, but the back button, browser back/forward, and page reload bypass `hasUnsavedChanges`.

## Approach: Shared `useUnsavedChangesGuard` Hook (Approach B)

One reusable hook handles all navigation scenarios. Components use its return values to render a consistent in-app prompt (matching the existing keepEditing/discard UI pattern).

## Hook API

```ts
// hooks/use-unsaved-changes-guard.ts
useUnsavedChangesGuard(isDirty: boolean, options: { onDiscard: () => void })
→ { showPrompt, triggerClose, confirmDiscard, keepEditing }
```

### Behaviours

| Trigger | Mechanism | Behaviour |
|---------|-----------|-----------|
| Browser close / refresh | `beforeunload` event | Browser shows native "Leave site?" when `isDirty` |
| Browser back/forward | `popstate` + history guard state | Re-pushes history to prevent navigation; sets `showPrompt = true` |
| X / Cancel button | `triggerClose()` | If dirty → `showPrompt = true`; else → `onDiscard()` immediately |
| Drawer swipe / Escape | Parent calls `requestClose()` via ref | Calls `triggerClose()` inside the form |

### History guard detail

- When `isDirty` becomes true: `history.pushState(null, '', location.href)` — inserts a guard entry
- On `popstate`: re-push guard (prevents actual navigation), show prompt
- On `confirmDiscard`: call `onDiscard()` (which may call `router.back()` for LyricsView page mode)
- On cleanup (`isDirty` → false): `popstate` listener removed; guard state stays harmlessly

## Components Changed

### 1. `hooks/use-unsaved-changes-guard.ts` — **NEW**
The shared hook as described above.

### 2. `features/song-draft/components/song-draft-form.tsx`
- Replace manual `showUnsavedPrompt` + `handleCancelClick` with the hook
- Wrap in `forwardRef` + expose `requestClose()` via `useImperativeHandle`

### 3. `features/songs/components/songs-client.tsx`
- Create `songDraftFormRef` pointing at `SongDraftForm`
- Drawer `onOpenChange(false)` when `isCreatingNewSong` → calls `formRef.current?.requestClose()` instead of `handleCloseSongDetail()` directly; Drawer stays open (controlled) until form confirms

### 4. `features/lyrics-editor/components/lyrics-view.tsx`
- Replace `hasUnsavedChanges + confirm()` with the hook
- `handleCancel` and `handleBack` → call `triggerClose()`
- `onDiscard` for page mode: `router.back()` / `onClose()`; for panel mode: just `onClose()`
- Render same keepEditing/discard inline prompt UI (no more `window.confirm`)

## Out of Scope

In-app Next.js soft navigation (clicking sidebar links while form is open) is not handled — intercepting `history.pushState` in App Router is too fragile. Browser back/forward and page reload cover the primary accidental loss scenarios.
