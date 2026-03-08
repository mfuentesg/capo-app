# Visual Drag-and-Drop Song Editor — Implementation Plan

**Date:** 2026-03-08
**GitHub Issue:** #38
**Status:** Pending

## Problem

The current ChordPro editor requires knowledge of the `{directive}` syntax and `[Chord]` inline notation. Non-technical musicians (worship leaders, teachers) can't easily create or edit songs. A visual block editor lets users build songs by placing chord tokens above syllables without writing any markup.

## Approach

Build a new `VisualSongEditor` component as an **alternative editing mode** alongside the existing CodeMirror editor. Users can toggle between "Code" and "Visual" modes. The visual editor represents a song as a list of `SongBlock` nodes (verse, chorus, bridge). Within each block, lyrics are editable text with chord chips that can be dragged to different positions using `@dnd-kit`.

The visual editor maintains a serializable intermediate representation (`VisualSongAST`) that is compiled to/from ChordPro when switching modes.

---

### Task 1: Define the intermediate AST

**Files:**
- Create: `features/lyrics-editor/types/visual-song-ast.ts`

```typescript
export interface ChordToken {
  chord: string
  /** Character offset within the lyric line where the chord appears */
  offset: number
}

export interface LyricLine {
  id: string
  text: string
  chords: ChordToken[]
}

export interface SongBlock {
  id: string
  type: "verse" | "chorus" | "bridge" | "intro" | "outro" | "tab" | "custom"
  label?: string
  lines: LyricLine[]
}

export interface VisualSongAST {
  title?: string
  artist?: string
  key?: string
  blocks: SongBlock[]
}
```

---

### Task 2: Build AST ↔ ChordPro converters

**Files:**
- Create: `features/lyrics-editor/utils/visual-ast-to-chordpro.ts`
- Create: `features/lyrics-editor/utils/chordpro-to-visual-ast.ts`

**AST → ChordPro:** Walk each block, emit `{start_of_verse}` / `{end_of_verse}` etc., and for each line, insert `[Chord]` at the correct character offset.

**ChordPro → AST:** Use `chordsheetjs` (already a dependency) to parse the ChordPro string into its object model, then map to `VisualSongAST`.

---

### Task 3: Build the `VisualSongEditor` component

**Files:**
- Create: `features/lyrics-editor/components/visual-song-editor.tsx`
- Create: `features/lyrics-editor/components/visual-song-block.tsx`
- Create: `features/lyrics-editor/components/visual-lyric-line.tsx`

**`VisualSongEditor`:**
- Renders a list of `<VisualSongBlock>` components
- "Add block" button (popover to choose type: Verse, Chorus, Bridge…)
- Blocks are reorderable via `@dnd-kit/sortable`

**`VisualSongBlock`:**
- Header: block type label (editable inline) + drag handle + delete button
- Body: list of `<VisualLyricLine>` components
- "Add line" button at bottom

**`VisualLyricLine`:**
- Two rows: chord row (top) + lyrics row (bottom)
- Lyrics row: contenteditable `<div>` or controlled `<input>`
- Chord row: chord chips rendered at their horizontal position above the lyric
- Clicking an empty spot in the chord row opens a chord picker popover
- Chord chips are draggable horizontally (`@dnd-kit` or simple mouse/touch drag)
- Each chord chip has an X button to remove it

---

### Task 4: Add mode toggle to `LyricsView`

**Files:**
- Modify: `features/lyrics-editor/components/lyrics-view.tsx`

Add a segmented control: **Code** | **Visual** in the editor toolbar.

- On switch to Visual: parse current ChordPro content → `VisualSongAST`
- On switch to Code: compile `VisualSongAST` → ChordPro and update the editor content
- Warn user if round-trip conversion loses information (e.g. unsupported directives)

```typescript
const [editorMode, setEditorMode] = useState<"code" | "visual">("code")

const handleModeSwitch = (mode: "code" | "visual") => {
  if (mode === "visual") {
    const ast = parseChordProToAST(editorContent)
    setVisualAST(ast)
  } else {
    const chordPro = compileASTToChordPro(visualAST)
    setEditorContent(chordPro)
  }
  setEditorMode(mode)
}
```

---

### Task 5: Chord picker component

**Files:**
- Create: `features/lyrics-editor/components/chord-picker.tsx`

A `Popover` with:
- Text input to type a chord name (with autocomplete from `@tombatossals/chords-db`)
- Grid of common chords for the song's key
- Confirmation adds the chord to the line at the clicked position

---

### Task 6: Tests

- Unit test `chordProToVisualAST`: parse a simple verse block
- Unit test `visualASTToChordPro`: compile a block back to ChordPro
- Unit test round-trip: parse → compile → parse should produce the same AST
- Component test: `VisualSongBlock` renders chord chips at correct positions

---

### Task 7: i18n

```json
{
  "editor": {
    "mode": { "code": "Code", "visual": "Visual" },
    "addBlock": "Add section",
    "addLine": "Add line",
    "blockTypes": {
      "verse": "Verse",
      "chorus": "Chorus",
      "bridge": "Bridge",
      "intro": "Intro",
      "outro": "Outro"
    }
  }
}
```

---

### Verification

```bash
pnpm lint && pnpm typecheck && pnpm test
```
