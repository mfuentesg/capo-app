# lyrics-editor

Displays and edits songs in ChordPro format. The feature handles the full lifecycle from raw text editing to formatted rendering with chord transposition, capo adjustment, and section management.

## Public API

```typescript
import {
  LyricsView,          // Full page/panel component for viewing and editing lyrics
  RenderedSong,        // Pure renderer — takes lyrics string, outputs formatted HTML
  LazySongEditor,      // CodeMirror editor with ChordPro syntax highlighting
  ChordProReference,   // Slide-in reference panel with directive documentation
  useLyricsSettings,   // Hook managing font size, transpose, capo state
} from "@/features/lyrics-editor"
```

## Components

### `LyricsView`

The top-level component used on the song lyrics page and in the song panel. Manages:
- Edit / view mode toggling
- Auto-save with save status indicator
- Transpose, capo, font size, and column layout settings
- A `BookOpen` help button that opens `ChordProReference`

Props:
```typescript
interface LyricsViewProps {
  song: Song
  mode?: "page" | "panel"           // affects layout and back-button behavior
  readOnly?: boolean
  onClose?: () => void
  onSaveLyrics?: (lyrics: string) => void
  isSaving?: boolean
  initialSettings?: { capo?: number; transpose?: number; fontSize?: number }
  onSettingsChange?: (settings: { capo: number; transpose: number; fontSize: number }) => void
  initialLyricsColumns?: 1 | 2
}
```

### `RenderedSong`

Parses and renders ChordPro text. Handles collapsible sections, repeat references, chord clicking, and multi-column layout. Not aware of editing state — purely a display component.

### `LazySongEditor`

Server-side-render-safe CodeMirror 6 wrapper. Provides:
- ChordPro syntax highlighting (chords in `[Chord]` style, directives in `{name: value}` style)
- Inline autocomplete triggered by `{` — suggests all known directives with examples

### `ChordProReference`

A controlled Sheet that shows all directives grouped by category, each with full name, shorthand (if any), description, and example code blocks. Includes a dedicated Performance Flags section.

## ChordPro Format Support

### Metadata directives
```
{title: Amazing Grace}
{artist: John Newton}
{key: G}   {tempo: 120}   {capo: 2}   {time: 4/4}
```

### Section directives

Section directives accept an optional **name**, **repeat count**, and **performance flags**, all comma-separated:

```
{sov: Verse 1}                   basic — no count, no flags
{sov: Verse 1, 2}                repeat count → header "VERSE 1 × 2"
{sov: Verse 1, 2, forte}         count + flag → "VERSE 1 × 2" with [f] badge
{soc: Chorus, attention, forte}  multiple flags, no count
{sob: Bridge, vamp}              flag only
```

Section types:
| Long form | Short | Default label |
|---|---|---|
| `start_of_verse` / `end_of_verse` | `sov` / `eov` | Verse |
| `start_of_chorus` / `end_of_chorus` | `soc` / `eoc` | Chorus |
| `start_of_bridge` / `end_of_bridge` | `sob` / `eob` | Bridge |
| `start_of_tab` / `end_of_tab` | `sot` / `eot` | Tab |
| `start_of_grid` / `end_of_grid` | `sog` / `eog` | Grid |

### Performance flags

Flags render as small inline badges next to the section header:

| Flag | Badge | Meaning |
|---|---|---|
| `attention` | amber `!` | Needs focus — easy to fumble live |
| `skip` | gray `skip` | Optional — can be omitted in shorter sets |
| `forte` | red italic `f` | Play loudly / with intensity |
| `piano` | blue italic `p` | Play softly / delicately |
| `vamp` | purple `vamp` | Repeat freely until cue (jazz/gospel) |
| `tag` | green `tag` | Tag ending — short closing phrase |
| `break` | gray `break` | Full-band rest/pause |

### Comments / section labels
```
{comment: Play slowly}         inline annotation
{c: Intro}                     shorthand — also usable as a {repeat} target
{comment_italic: ad lib}
{comment_box: KEY CHANGE HERE}
```

### Custom `{repeat}` directive

References a named section defined earlier in the song and renders its content inline. The referenced name must match a section or comment label (case-insensitive):

```
{soc: Chorus}
[G]How great thou [C]art
{eoc}

{repeat: Chorus}       renders Chorus section, label "CHORUS"
{repeat: Chorus, 2}    renders it, label "CHORUS × 2"
{repeat: Chorus, 3}    renders it, label "CHORUS × 3"
```

Also works with `{comment: Name}` labels:
```
{c: Intro}
[D]Some intro riff...

{repeat: Intro, 2}
```

## Rendering pipeline

```
Raw ChordPro text (string)
  ↓
buildSectionMap()          — extracts named section content into a Map<name, content>
  ↓
buildSegments()            — scans for section/repeat/comment directives, builds segment list
  ↓  for each segment:
formatLyricsToHtml()       — preprocesses directives → ChordProParser → chord+lyric HTML
  ↓
React render               — segments rendered as collapsible SectionHeader + content blocks
```

`formatLyricsToHtml` uses `chordsheetjs@^12.3.1` for chord/lyric parsing and transposition. Section directives are preprocessed into placeholder tokens before parsing because ChordProParser does not preserve them in the AST.

## Settings persistence

`useLyricsSettings` manages three controls:
- **Font size** — multiplier 0.5–3.0, default 1.0
- **Transpose** — semitones −6 to +6, default 0
- **Capo** — frets 0–12, default 0

Per-song values are persisted via `useUpsertUserSongSettings`. Global preferences (column layout) use `useUpsertUserPreferences`.

## Data files

- `data/chordpro-directives.ts` — typed registry (`CHORDPRO_DIRECTIVES`, `SECTION_FLAG_DOCS`) used by `ChordProReference`
- `utils/chordpro-lang.ts` — CodeMirror StreamLanguage definition + autocomplete extension
