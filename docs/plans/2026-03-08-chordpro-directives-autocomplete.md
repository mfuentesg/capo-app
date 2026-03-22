# ChordPro Directives Autocomplete & Documentation — Implementation Plan

**Date:** 2026-03-08
**GitHub Issue:** #37
**Status:** Partially completed (2026-03-22)

**Implemented:**
- `features/lyrics-editor/data/chordpro-directives.ts` — typed directive registry with descriptions, examples, and flag documentation (`CHORDPRO_DIRECTIVES`, `SECTION_FLAG_DOCS`)
- `features/lyrics-editor/components/chordpro-reference.tsx` — reference Sheet panel accessible via BookOpen button in `LyricsView` header; groups directives by category with full/shorthand names, descriptions, and code examples; includes a Performance Flags section
- Autocomplete `detail` strings updated in `chordpro-lang.ts` to hint count + flag syntax

**Not yet implemented:**
- Rich autocomplete `info()` popover (showing description + example on hover in CodeMirror dropdown) — Task 2 of the original plan

## Problem

The CodeMirror editor supports ChordPro syntax, but non-technical users don't know what directives exist or what they do. The autocomplete only suggests directive names without descriptions or examples. A richer autocomplete and an inline help panel would greatly improve discoverability.

## Approach

1. Build a typed `CHORDPRO_DIRECTIVES` registry with names, descriptions, and examples.
2. Replace the current autocomplete source with one that uses this registry to show rich completions (label + detail + info).
3. Add a collapsible "ChordPro Reference" panel next to the editor, accessible via a help button.

---

### Task 1: Create the directives registry

**Files:**
- Create: `features/lyrics-editor/data/chordpro-directives.ts`

```typescript
export interface ChordProDirective {
  name: string
  shorthand?: string
  category: "metadata" | "formatting" | "chord" | "environment" | "output"
  description: string
  example: string
  /** If true, directive wraps a block (has a matching {end_X}) */
  isBlock?: boolean
}

export const CHORDPRO_DIRECTIVES: ChordProDirective[] = [
  // Metadata
  {
    name: "title",
    shorthand: "t",
    category: "metadata",
    description: "Sets the song title.",
    example: "{title: Amazing Grace}"
  },
  {
    name: "subtitle",
    shorthand: "st",
    category: "metadata",
    description: "Sets a subtitle, often the artist name.",
    example: "{subtitle: Traditional}"
  },
  {
    name: "artist",
    category: "metadata",
    description: "The artist or composer of the song.",
    example: "{artist: John Newton}"
  },
  {
    name: "key",
    category: "metadata",
    description: "The musical key of the song.",
    example: "{key: G}"
  },
  {
    name: "capo",
    category: "metadata",
    description: "Capo fret position.",
    example: "{capo: 2}"
  },
  {
    name: "tempo",
    category: "metadata",
    description: "Song tempo in BPM.",
    example: "{tempo: 120}"
  },
  {
    name: "time",
    category: "metadata",
    description: "Time signature.",
    example: "{time: 4/4}"
  },
  // Formatting
  {
    name: "comment",
    shorthand: "c",
    category: "formatting",
    description: "Displays a comment/annotation in the rendered output.",
    example: "{comment: Play slowly}"
  },
  {
    name: "new_page",
    shorthand: "np",
    category: "formatting",
    description: "Forces a page break in print output.",
    example: "{new_page}"
  },
  {
    name: "column_break",
    shorthand: "cb",
    category: "formatting",
    description: "Forces a column break in multi-column output.",
    example: "{column_break}"
  },
  // Environments (blocks)
  {
    name: "start_of_verse",
    shorthand: "sov",
    category: "environment",
    description: "Marks the beginning of a verse section.",
    example: "{start_of_verse: Verse 1}",
    isBlock: true
  },
  {
    name: "end_of_verse",
    shorthand: "eov",
    category: "environment",
    description: "Marks the end of a verse section.",
    example: "{end_of_verse}"
  },
  {
    name: "start_of_chorus",
    shorthand: "soc",
    category: "environment",
    description: "Marks the beginning of a chorus section.",
    example: "{start_of_chorus}",
    isBlock: true
  },
  {
    name: "end_of_chorus",
    shorthand: "eoc",
    category: "environment",
    description: "Marks the end of a chorus section.",
    example: "{end_of_chorus}"
  },
  {
    name: "start_of_bridge",
    shorthand: "sob",
    category: "environment",
    description: "Marks the beginning of a bridge section.",
    example: "{start_of_bridge}",
    isBlock: true
  },
  {
    name: "end_of_bridge",
    shorthand: "eob",
    category: "environment",
    description: "Marks the end of a bridge section.",
    example: "{end_of_bridge}"
  },
  {
    name: "start_of_tab",
    shorthand: "sot",
    category: "environment",
    description: "Marks the beginning of a guitar tab section.",
    example: "{start_of_tab}",
    isBlock: true
  },
  {
    name: "end_of_tab",
    shorthand: "eot",
    category: "environment",
    description: "Marks the end of a guitar tab section.",
    example: "{end_of_tab}"
  },
  // Chord
  {
    name: "define",
    category: "chord",
    description: "Defines a custom chord fingering.",
    example: "{define: Asus2 base-fret 1 frets 0 0 2 2 0 0}"
  }
]
```

---

### Task 2: Update CodeMirror autocomplete to use the registry

**Files:**
- Modify: `features/lyrics-editor/utils/chordpro-language.ts` (or wherever the CodeMirror language extension is defined)

```typescript
import { autocompletion, CompletionContext, CompletionResult } from "@codemirror/autocomplete"
import { CHORDPRO_DIRECTIVES } from "../data/chordpro-directives"

function chordProCompletions(context: CompletionContext): CompletionResult | null {
  // Match '{' followed by optional partial directive name
  const match = context.matchBefore(/\{[a-z_]*/)
  if (!match || (match.from === match.to && !context.explicit)) return null

  const typed = match.text.slice(1) // remove leading '{'

  return {
    from: match.from + 1, // replace after '{'
    options: CHORDPRO_DIRECTIVES.flatMap((d) => {
      const opts = [
        {
          label: d.name,
          detail: d.category,
          info: () => {
            const node = document.createElement("div")
            node.innerHTML = `<p>${d.description}</p><pre><code>${d.example}</code></pre>`
            return node
          },
          apply: d.isBlock
            ? `${d.name}}\n\n{end_of_${d.name.replace("start_of_", "")}`
            : `${d.name}${d.example.includes(":") ? ": " : "}"}`
        }
      ]
      if (d.shorthand) {
        opts.push({
          label: d.shorthand,
          detail: `shorthand for {${d.name}}`,
          info: () => {
            const node = document.createElement("div")
            node.textContent = `Shorthand for {${d.name}}. ${d.description}`
            return node
          },
          apply: d.name + (d.example.includes(":") ? ": " : "}")
        })
      }
      return opts
    }).filter((o) => o.label.startsWith(typed))
  }
}

export const chordProAutocomplete = autocompletion({
  override: [chordProCompletions]
})
```

---

### Task 3: Add a ChordPro Reference panel

**Files:**
- Create: `features/lyrics-editor/components/chordpro-reference.tsx`

A collapsible panel that renders `CHORDPRO_DIRECTIVES` grouped by category. Each entry shows the directive name, shorthand (if any), description, and a code block with the example.

Toggled via a `?` / "Help" button in the editor toolbar.

---

### Task 4: Export new items from feature index

**Files:**
- Modify: `features/lyrics-editor/index.ts`

Export `CHORDPRO_DIRECTIVES`, `ChordProDirective`, and `ChordProReference`.

---

### Task 5: Tests

- Unit test the autocomplete function: given `{soc`, returns completion for `start_of_chorus`
- Unit test shorthand matching: `{t` matches `title` and `tempo`

---

### Verification

```bash
pnpm lint && pnpm typecheck && pnpm test
```
