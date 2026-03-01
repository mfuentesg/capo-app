# ChordPro Visual Editor — Implementation Plan

## What We're Building

A visual "Chord Strip" editor that replaces the raw text experience when editing lyrics.
It lives alongside the existing Monaco editor — a **Visual / Code** toggle in the editing
header switches between them. Both read/write the same `editedLyrics` string (raw ChordPro),
so switching is always lossless.

---

## Example: What it looks Like

### Normal verse line — `[G]Amazing [D]grace, how [G]sweet the [C]sound`

```
┌──────────────────┬──────────────────┬──────────────────┬──────────────┐
│  G               │  D               │  G               │  C           │
│  Amazing         │  grace, how      │  sweet the       │  sound       │
└──────────────────┴──────────────────┴──────────────────┴──────────────┘
[+ chord]                                                    [⊕ add line]
```

Each **token block** = one `{chord, lyric}` pair. The chord sits above; the lyric below.

- Click the chord badge → open chord builder to **edit or remove** it
- Click anywhere on the lyric text → calculates character offset → **insert chord at that exact position** (mid-word, start, end)
- `[+ chord]` at the end of the row → add a new chord-only token at the end

### Mid-word insertion flow — clicking between "A" and "m" in "Amazing"

```
Before click:                    After chord added:
┌──────────────────┐             ┌────────┬──────────────────┐
│  G               │             │  G     │  D7              │
│  Amazing         │   →click→   │  A     │  mazing          │
└──────────────────┘             └────────┴──────────────────┘
```

The token `{chord:'G', lyric:'Amazing'}` is split at offset 1 into
`{chord:'G', lyric:'A'}` + `{chord:'D7', lyric:'mazing'}`.

### Chord-only line — `[Em] [G] [D] [G]` (bridge / intro / instrumental)

```
┌──────┬──────┬──────┬──────┬────────────┐
│  Em  │  G   │  D   │  G   │  + chord   │
│      │      │      │      │            │
└──────┴──────┴──────┴──────┴────────────┘
                                           [⊕ add line]
```

Lyric row is empty — just chord tokens with empty `lyric` strings. The empty row is
rendered with a minimum height so the block is still visible and clickable.

### Directive line — `{title: Amazing Grace}`

```
┌──────────────────────────────────────────┐
│ 📌  title: Amazing Grace                 │  ← read-only, styled pill
└──────────────────────────────────────────┘
```

### Chord Builder Popover (opens on click of any chord badge or `+ chord`)

```
┌─ Chord Builder ──────────────────────────────┐
│              Am7                             │  ← live preview
├──────────────────────────────────────────────┤
│  Root note                       [Sharps / ♭] │
│  [C] [C#] [D] [D#] [E] [F] [F#] [G] [G#]   │
│  [A] [A#] [B]                                │
│                              ●  (A selected) │
├──────────────────────────────────────────────┤
│  Quality                                     │
│  [maj] [m] [7] [maj7] [m7] [dim] [aug]       │
│  [sus2] [sus4] [add9] [dim7] [m7b5]          │
│         ●  (m selected)                      │
├──────────────────────────────────────────────┤
│  Bass note  (optional)                       │
│  [—]  [C] [C#] [D] [D#] [E] [F] [F#]...     │
│   ●   (none)                                 │
├──────────────────────────────────────────────┤
│  [Remove chord]          [Add / Update chord] │
└──────────────────────────────────────────────┘
```

---

## Data Model

```typescript
// features/lyrics-editor/utils/chord-pro-visual.ts

export type ChordToken = {
  chord: string | null  // null = no chord above this segment
  lyric: string         // lyric text (can be "" for chord-only positions)
}

export type VisualLine =
  | { type: "chord-lyric"; tokens: ChordToken[] }
  | { type: "directive"; raw: string }   // e.g. "{title: Amazing Grace}"
  | { type: "empty" }                    // blank line between verses
```

---

## File Plan

### New files (3)

| File | Purpose |
|------|---------|
| `features/lyrics-editor/utils/chord-pro-visual.ts` | Parse ChordPro → `VisualLine[]`, serialize back |
| `features/lyrics-editor/components/chord-builder.tsx` | Chord picker popover content |
| `features/lyrics-editor/components/chord-pro-visual-editor.tsx` | Main visual editor |

### Modified files (4)

| File | Change |
|------|--------|
| `features/lyrics-editor/components/lyrics-view.tsx` | Add Visual/Code toggle in edit header |
| `features/lyrics-editor/components/index.ts` | Export `ChordProVisualEditor` |
| `lib/i18n/locales/en.json` | New keys under `songs.lyrics` |
| `lib/i18n/locales/es.json` | Spanish equivalents |

---

## Step-by-Step Implementation

---

### Step 1 — `features/lyrics-editor/utils/chord-pro-visual.ts`

Two exported functions: `parseToVisual` and `visualToChordPro`.

**`parseToVisual(chordpro: string): VisualLine[]`**

Use `ChordProParser` from `chordsheetjs`. Iterate `song.lines`:
- If line has zero items → `{ type: "empty" }`
- If first item is a `Tag` (has `.name`) → `{ type: "directive", raw: \`{\${item.name}: \${item.value}}\`` }
- Otherwise → `{ type: "chord-lyric", tokens: line.items.map(item => ({ chord: item.chords || null, lyric: item.lyrics || "" })) }`

Wrap in try/catch — on parse error fall back to splitting on `\n` and producing
`{ type: "chord-lyric", tokens: [{ chord: null, lyric: line }] }` per line.

Edge cases:
- A line like `[Am] [G]` produces items `[{chords:'Am', lyrics:' '}, {chords:'G', lyrics:''}]`
  → tokens `[{chord:'Am', lyric:' '}, {chord:'G', lyric:''}]` — this is a chord-only line.
- A line with only a trailing chord like `Hello[Am]` → items `[{chords:null, lyrics:'Hello'}, {chords:'Am', lyrics:''}]`
  → tokens `[{chord:null, lyric:'Hello'}, {chord:'Am', lyric:''}]`

**`visualToChordPro(lines: VisualLine[]): string`**

Map each line:
- `empty` → `""`
- `directive` → `line.raw`
- `chord-lyric` → `line.tokens.map(t => (t.chord ? \`[\${t.chord}]\` : "") + t.lyric).join("")`

Join with `"\n"`.

**Roundtrip fidelity note**: chordsheetjs normalizes chord spacing on parse. To avoid
drift on each roundtrip, always re-parse from the raw ChordPro string (stored in state),
not from a previously serialized visual model.

**Also export** a small helper used by the chord builder:
```typescript
export function parseChordString(chord: string): { root: string; quality: string; bass: string | null }
export function buildChordString(root: string, quality: string, bass: string | null): string
```

`parseChordString` splits on `/` for bass, then matches `/^([A-G][#b]?)(.*)$/` on the main part.

---

### Step 2 — `features/lyrics-editor/components/chord-builder.tsx`

A self-contained component rendered inside a `PopoverContent`. Props:

```typescript
interface ChordBuilderProps {
  value: string | null          // existing chord, or null for "add new"
  onConfirm: (chord: string) => void
  onRemove: () => void
  onCancel: () => void
}
```

Internal state: `root: string | null`, `quality: string`, `bass: string | null`, `useFlats: boolean`.

On mount, if `value` is non-null, call `parseChordString(value)` to seed the state.

**Sections (stack vertically, no tabs — one compact view):**

1. **Preview row**: `text-2xl font-bold text-primary` showing `root + quality + (bass ? "/" + bass : "")` or `"—"` if no root.

2. **Root note grid** (2 rows × 6 cols):
   - Sharp mode: `C C# D D# E F F# G G# A A# B`
   - Flat mode:  `C Db D Eb E F Gb G Ab A Bb B`
   - Toggle button top-right: `# Sharps` / `♭ Flats` (ghost/sm)
   - Each note is a `Button` (outline / default if selected), size sm, `h-8 px-1 text-xs`.

3. **Quality grid** (3 rows × 4 cols) — only shown after root is selected:
   ```
   const QUALITIES = [
     { label: "maj", value: "" },
     { label: "m",   value: "m" },
     { label: "7",   value: "7" },
     { label: "maj7",value: "maj7" },
     { label: "m7",  value: "m7" },
     { label: "dim", value: "dim" },
     { label: "aug", value: "aug" },
     { label: "sus2",value: "sus2" },
     { label: "sus4",value: "sus4" },
     { label: "add9",value: "add9" },
     { label: "dim7",value: "dim7" },
     { label: "m7b5",value: "m7b5" },
   ]
   ```
   Same button style. `value: ""` = major (no suffix).

4. **Bass note row** (shown after root is selected) — a `—` button plus the same 12 notes.
   Selecting `—` sets `bass = null`.

5. **Action row**:
   - If `value` is non-null: `[Remove]` button (destructive, sm) + `[Update chord]` (default, sm, disabled if no root)
   - If `value` is null: `[Cancel]` (outline, sm) + `[Add chord]` (default, sm, disabled if no root)

Total popover width: `w-72`. Use `useTranslation` for all button labels.

---

### Step 3 — `features/lyrics-editor/components/chord-pro-visual-editor.tsx`

```typescript
interface ChordProVisualEditorProps {
  content: string
  onChange: (value: string) => void
}
```

**State:**
- `lines: VisualLine[]` — derived from `content` via `parseToVisual`
- `activePopover: { lineIdx: number; tokenIdx: number } | null`

**Sync rule**: Lines state is the source of truth while editing. When `content` prop changes
from *outside* (e.g. user switches from Code editor), re-parse: use a `useEffect` that
compares `visualToChordPro(lines)` vs `content` — only re-parse if they differ (prevents
re-parse on every keystroke that originates from this component).

**Helper — `commit(newLines: VisualLine[])`**: sets lines + calls `onChange(visualToChordPro(newLines))`.

---

#### Rendering a `chord-lyric` line

```
<div className="group flex flex-col">
  {/* Chord row */}
  <div className="flex flex-wrap items-end gap-px min-h-7">
    {tokens.map((token, tokenIdx) => (
      <div key={tokenIdx} className="inline-flex flex-col items-start">
        {/* Chord badge or empty slot */}
        {token.chord ? (
          <button
            className="text-xs font-bold text-primary px-1 rounded hover:bg-primary/10"
            onClick={() => openPopover(lineIdx, tokenIdx)}
          >
            {token.chord}
          </button>
        ) : (
          <div className="h-5" />   {/* spacer so lyric row aligns */}
        )}
        {/* Lyric segment — clickable to insert chord */}
        <span
          className="font-mono text-sm whitespace-pre cursor-text select-none hover:bg-muted/50 rounded px-0.5 min-w-3 min-h-5 inline-block"
          onClick={(e) => handleLyricClick(e, lineIdx, tokenIdx)}
        >
          {token.lyric || "\u00A0"}
        </span>
      </div>
    ))}
    {/* Add chord at end */}
    <button
      className="text-xs text-muted-foreground hover:text-foreground px-1 opacity-0 group-hover:opacity-100"
      onClick={() => handleAddChordAtEnd(lineIdx)}
    >
      + chord
    </button>
  </div>
</div>
```

**`handleLyricClick(e, lineIdx, tokenIdx)`:**
```typescript
const el = e.currentTarget
const text = el.textContent ?? ""
if (!text.trim()) {
  // Empty lyric (chord-only token) — open chord builder for this slot
  openPopover(lineIdx, tokenIdx)
  return
}
const rect = el.getBoundingClientRect()
const x = e.clientX - rect.left
const charWidth = rect.width / text.length
const offset = Math.min(Math.round(x / charWidth), text.length)
// Split token at offset and open chord builder for the new second token
splitTokenAndOpen(lineIdx, tokenIdx, offset)
```

**`splitTokenAndOpen(lineIdx, tokenIdx, offset)`:**
```typescript
const newLines = structuredClone(lines)
const line = newLines[lineIdx]
if (line.type !== "chord-lyric") return
const token = line.tokens[tokenIdx]
const before = token.lyric.slice(0, offset)
const after = token.lyric.slice(offset)
line.tokens.splice(tokenIdx, 1,
  { chord: token.chord, lyric: before },
  { chord: null,        lyric: after  }
)
setLines(newLines)
// Open popover on the new second token (tokenIdx + 1), not committing yet
setActivePopover({ lineIdx, tokenIdx: tokenIdx + 1 })
```

When the chord builder confirms, update `lines[lineIdx].tokens[tokenIdx+1].chord`, then
commit. If the builder is cancelled, merge the two tokens back.

**Chord update handler** (called from ChordBuilder `onConfirm`):
```typescript
const newLines = structuredClone(lines)
const line = newLines[activePopover.lineIdx]
if (line.type === "chord-lyric") {
  line.tokens[activePopover.tokenIdx].chord = chord
  // Merge empty adjacent tokens with null chords to keep the model clean
  normalizeTokens(line)
}
commit(newLines)
setActivePopover(null)
```

**`normalizeTokens(line)`** — merge consecutive tokens where both `chord` is null and
the combined lyric is safe to merge. This prevents token proliferation on cancel.

**Chord removal** (called from ChordBuilder `onRemove`):
- Set `token.chord = null`
- Merge token with next token if next token also has `chord === null`
- Commit

**`handleAddChordAtEnd(lineIdx)`:**
Append `{ chord: null, lyric: "" }` to the line's tokens, open popover for that new token.
On confirm → set chord; on cancel → remove the appended token.

---

#### Line management UI

Each line has a right-side control group (visible on hover, `group-hover:flex`):
- `⊕` button → `addLineAfter(lineIdx)` — inserts `{ type: "chord-lyric", tokens: [{ chord: null, lyric: "" }] }`
- `✕` button → `removeLine(lineIdx)` — only shown when `lines.length > 1`

**Directive line** → just render a read-only badge:
```tsx
<div className="flex items-center gap-2 py-1 text-muted-foreground text-xs">
  <Pin className="h-3 w-3" />
  <span>{line.raw}</span>
</div>
```

**Empty line** → a thin `<div className="h-4" />` spacer with the same hover controls.

---

#### Popover wiring

Use `Popover` + `PopoverTrigger` + `PopoverContent` from `@/components/ui/popover`.
Because we want programmatic open/close, use `open` + `onOpenChange` (controlled popover).
`createOverlayIds` for accessibility ids.

Wrap the entire editor in `<div className="relative">`. The single `<Popover open={activePopover !== null}>` floats anchored to the active token's chord button using `PopoverAnchor`.

Alternatively (simpler): render one `<Popover>` per token. Since only one can be open at
a time this is fine; it avoids managing a ref for the anchor element.

---

### Step 4 — Modify `lyrics-view.tsx`

Add `editorMode: "visual" | "code"` state (default `"visual"`).

In the editing header (inside `{canEdit && isEditing && ...}` block), after the existing
Cancel button, add a segmented toggle:

```tsx
<div className="flex items-center rounded-md border overflow-hidden">
  <Button
    variant={editorMode === "visual" ? "secondary" : "ghost"}
    size="sm"
    className="rounded-none border-r"
    onClick={() => setEditorMode("visual")}
  >
    <Layout className="h-3.5 w-3.5 mr-1.5" />
    {t.songs.lyrics.visualEditor}
  </Button>
  <Button
    variant={editorMode === "code" ? "secondary" : "ghost"}
    size="sm"
    className="rounded-none"
    onClick={() => setEditorMode("code")}
  >
    <Code2 className="h-3.5 w-3.5 mr-1.5" />
    {t.songs.lyrics.codeEditor}
  </Button>
</div>
```

Import `Layout`, `Code2` from `lucide-react`.

In the content area, replace the single `<LazySongEditor>` with:
```tsx
{editorMode === "visual" ? (
  <ChordProVisualEditor content={editedLyrics} onChange={handleLyricsChange} />
) : (
  <LazySongEditor content={editedLyrics} onChange={handleLyricsChange} />
)}
```

Both use the existing `handleLyricsChange` which updates `editedLyrics` + `hasUnsavedChanges`.

Reset `editorMode` to `"visual"` when `isEditing` becomes `false` (in `handleCancel` /
`handleSave` / `handleDiscard`).

---

### Step 5 — Modify `features/lyrics-editor/components/index.ts`

```typescript
export { LyricsView } from "./lyrics-view"
export { RenderedSong } from "./rendered-song"
export { ChordProVisualEditor } from "./chord-pro-visual-editor"
```

---

### Step 6 — i18n

**`lib/i18n/locales/en.json`** — extend `songs.lyrics`:

```json
"lyrics": {
  "settings": "Settings",
  "displaySettings": "Display Settings",
  "displaySettingsDescription": "Adjust font size, transpose, and capo",
  "fontSize": "Font Size",
  "visualEditor": "Visual",
  "codeEditor": "Code",
  "chordBuilder": {
    "addChord": "Add chord",
    "updateChord": "Update chord",
    "removeChord": "Remove chord",
    "rootNote": "Root note",
    "quality": "Quality",
    "bassNote": "Bass (optional)",
    "sharps": "Sharps",
    "flats": "Flats",
    "addLine": "Add line",
    "removeLine": "Remove line"
  }
}
```

**`lib/i18n/locales/es.json`** — same structure, translated:

```json
"lyrics": {
  "settings": "Configuración",
  "displaySettings": "Configuración de visualización",
  "displaySettingsDescription": "Ajusta el tamaño de fuente, transposición y cejilla",
  "fontSize": "Tamaño de fuente",
  "visualEditor": "Visual",
  "codeEditor": "Código",
  "chordBuilder": {
    "addChord": "Agregar acorde",
    "updateChord": "Actualizar acorde",
    "removeChord": "Eliminar acorde",
    "rootNote": "Nota raíz",
    "quality": "Calidad",
    "bassNote": "Bajo (opcional)",
    "sharps": "Sostenidos",
    "flats": "Bemoles",
    "addLine": "Agregar línea",
    "removeLine": "Eliminar línea"
  }
}
```

---

## Edge Cases & Decisions

| Case | Handling |
|------|---------|
| Token with empty lyric (chord at end of line) | Render `\u00A0` (non-breaking space) so the span is clickable; clicking it calls `openPopover` directly |
| User clicks offset 0 on a lyric | A chord is inserted *before* the lyric — this is valid ChordPro: `[Am]lyrics` |
| Removing chord from first token (chord:X, lyric:"") | Set `chord = null`, then call `normalizeTokens` which merges the empty-chord empty-lyric token into the next one |
| All tokens on a line get their chords removed | Line becomes a single `{chord: null, lyric: "full text"}` — normal lyric line |
| Switching Code → Visual | Re-parse from Monaco content; if parse fails gracefully, keep showing code editor with a warning |
| Switching Visual → Code | Just use `editedLyrics` directly — no conversion needed |
| Chord string with accidentals already in flat mode | `parseChordString` detects if root contains `b` → pre-select ♭ mode in builder |
| Empty song (no lyrics yet) | `parseToVisual("")` returns `[{ type: "chord-lyric", tokens: [{ chord: null, lyric: "" }] }]` — one blank line ready to use |

---

## Verification

1. `pnpm typecheck` — zero errors
2. `pnpm lint` — zero warnings
3. `pnpm test` — all existing tests pass
4. Manual: open a song with lyrics, click "Edit Lyrics" → Visual tab is shown by default
5. Manual: click a chord → chord builder opens, shows current chord pre-selected
6. Manual: update quality → preview updates live, confirm → chord updates in visual and raw ChordPro
7. Manual: click mid-word → chord builder opens → confirm → word splits correctly
8. Manual: switch to Code tab → raw ChordPro reflects all edits → edit in Monaco → switch back to Visual → visual reflects Monaco changes
9. Manual: save → rendered preview matches what visual editor showed
10. Manual: `[Am] [G] [C]` chord-only line → visual shows three chord blocks with empty lyric row
11. `pnpm i18n:validate` — passes
