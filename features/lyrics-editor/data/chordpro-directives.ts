export interface ChordProDirective {
  name: string
  shorthand?: string
  category: "metadata" | "section" | "comment" | "chord" | "formatting"
  description: string
  example: string
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
    category: "metadata",
    description: "Sets a subtitle, often used for an alternate title or arrangement note.",
    example: "{subtitle: Traditional}"
  },
  {
    name: "artist",
    category: "metadata",
    description: "The artist or band name.",
    example: "{artist: John Newton}"
  },
  {
    name: "composer",
    category: "metadata",
    description: "The composer of the song.",
    example: "{composer: Johann Sebastian Bach}"
  },
  {
    name: "lyricist",
    category: "metadata",
    description: "The lyricist of the song.",
    example: "{lyricist: Isaac Watts}"
  },
  {
    name: "copyright",
    category: "metadata",
    description: "Copyright information.",
    example: "{copyright: 2024 Example Music}"
  },
  {
    name: "album",
    category: "metadata",
    description: "The album this song appears on.",
    example: "{album: Greatest Hymns}"
  },
  {
    name: "year",
    category: "metadata",
    description: "The release year of the song.",
    example: "{year: 1779}"
  },
  {
    name: "key",
    shorthand: "k",
    category: "metadata",
    description: "The musical key of the song.",
    example: "{key: G}"
  },
  {
    name: "time",
    category: "metadata",
    description: "The time signature.",
    example: "{time: 4/4}"
  },
  {
    name: "tempo",
    category: "metadata",
    description: "Song tempo in beats per minute.",
    example: "{tempo: 120}"
  },
  {
    name: "duration",
    category: "metadata",
    description: "Song duration.",
    example: "{duration: 3:45}"
  },
  {
    name: "capo",
    shorthand: "ca",
    category: "metadata",
    description: "Capo fret position. Chords in the editor are written as if no capo is used; the app adjusts the display.",
    example: "{capo: 2}"
  },
  {
    name: "meta",
    category: "metadata",
    description: "Custom metadata key/value pair.",
    example: "{meta: difficulty easy}"
  },

  // Sections
  {
    name: "start_of_verse",
    shorthand: "sov",
    category: "section",
    description:
      "Marks the beginning of a verse section. Accepts an optional name, repeat count, and performance flags. Pair with {end_of_verse} or {eov}.",
    example:
      "{sov: Verse 1}\n[G]Amazing [D]grace, how [Em]sweet the [G]sound\nThat [G]saved a [C]wretch like [G]me\n{eov}\n\n{sov: Verse 2, 2}         ← play twice\n{sov: Verse 3, piano}     ← soft, delicate"
  },
  {
    name: "start_of_chorus",
    shorthand: "soc",
    category: "section",
    description:
      "Marks the beginning of a chorus section. Accepts an optional name, repeat count, and performance flags. Pair with {end_of_chorus} or {eoc}.",
    example:
      "{soc: Chorus}\n[G]How [G]great thou [C]art\nHow [G]great thou [D7]art\n{eoc}\n\n{soc: Chorus, 3}           ← play three times\n{soc: Chorus, attention}   ← mark as needing focus"
  },
  {
    name: "start_of_bridge",
    shorthand: "sob",
    category: "section",
    description:
      "Marks the beginning of a bridge section. Accepts an optional name, repeat count, and performance flags. Pair with {end_of_bridge} or {eob}.",
    example:
      "{sob: Bridge}\n[Am]Then sings my [F]soul\nMy [C]Saviour God to [G]thee\n{eob}\n\n{sob: Bridge, vamp}  ← repeat freely until cue"
  },
  {
    name: "start_of_tab",
    shorthand: "sot",
    category: "section",
    description: "Marks the beginning of a guitar tablature section. Pair with {end_of_tab} or {eot}.",
    example:
      "{sot: Intro}\ne|--0--2--3--2--0----|\nB|--1--1--1--1--1----|\nG|--0--0--0--0--0----|\n{eot}"
  },
  {
    name: "start_of_grid",
    shorthand: "sog",
    category: "section",
    description: "Marks the beginning of a chord grid section. Pair with {end_of_grid} or {eog}.",
    example:
      "{sog: Progression}\n| C . . . | G . . . |\n| Am . . . | F . . . |\n{eog}"
  },

  // Custom extensions — not part of the official ChordPro specification
  {
    name: "start_of_intro",
    shorthand: "soi",
    category: "section",
    description:
      "Marks the beginning of an intro section. Pair with {end_of_intro} or {eoi}. Add the 'inline' flag to render all lines with chords and lyrics side-by-side (e.g. Bass: Gm Bb x2) instead of stacked. Custom extension.",
    example:
      "{soi: Intro, inline}\nBass: [Gm][Bb][Dm] x2\nElectric Guitar: [Gm] x2\n{eoi}"
  },
  {
    name: "start_of_outro",
    shorthand: "soo",
    category: "section",
    description:
      "Marks the beginning of an outro section. Pair with {end_of_outro} or {eoo}. Accepts an optional name, repeat count, and performance flags. Custom extension.",
    example: "{soo: Outro}\n[Gm][Bb][Dm] x2\n{eoo}"
  },
  {
    name: "start_of_pre_chorus",
    shorthand: "sopc",
    category: "section",
    description:
      "Marks the beginning of a pre-chorus section. Pair with {end_of_pre_chorus} or {eopc}. Accepts an optional name, repeat count, and performance flags. Custom extension.",
    example:
      "{sopc: Pre-Chorus}\n[Em]Every day I'm getting [C]closer\n{eopc}"
  },

  // Comments
  {
    name: "comment",
    shorthand: "c",
    category: "comment",
    description:
      "Displays an inline annotation in the rendered output. A named comment also acts as a section label for {repeat} references.",
    example: "{comment: Play softly}\n{c: Capo 2}\n{c: Intro} ← can be referenced by {repeat: Intro}"
  },
  {
    name: "comment_italic",
    category: "comment",
    description: "Like {comment} but rendered in italic.",
    example: "{comment_italic: ad lib}"
  },
  {
    name: "comment_box",
    category: "comment",
    description: "Like {comment} but rendered in a box.",
    example: "{comment_box: IMPORTANT: key change here}"
  },

  // Chord definitions
  {
    name: "define",
    category: "chord",
    description: "Defines a custom chord fingering using fret positions.",
    example: "{define: Asus2 base-fret 1 frets 0 0 2 2 0 0}"
  },
  {
    name: "chord",
    category: "chord",
    description: "Alias for {define}.",
    example: "{chord: Dm7 base-fret 1 frets x 0 0 2 1 1}"
  },
  {
    name: "textfont",
    category: "chord",
    description: "Sets the font for lyrics text.",
    example: "{textfont: Georgia}"
  },
  {
    name: "textsize",
    category: "chord",
    description: "Sets the size for lyrics text.",
    example: "{textsize: 14}"
  },
  {
    name: "textcolour",
    shorthand: "textcolor",
    category: "chord",
    description: "Sets the colour for lyrics text.",
    example: "{textcolour: #333333}"
  },
  {
    name: "chordfont",
    category: "chord",
    description: "Sets the font for chord names.",
    example: "{chordfont: Arial}"
  },
  {
    name: "chordsize",
    category: "chord",
    description: "Sets the size for chord names.",
    example: "{chordsize: 12}"
  },
  {
    name: "chordcolour",
    shorthand: "chordcolor",
    category: "chord",
    description: "Sets the colour for chord names.",
    example: "{chordcolour: #4a90d9}"
  },

  // Custom directives
  {
    name: "repeat",
    category: "formatting",
    description:
      "References a previously defined named section and renders its content inline. Supports an optional repeat count. The section must be defined using {soc/sov/sob: Name} or {comment: Name} earlier in the song.",
    example:
      "{soc: Chorus}\n[G]How great thou [C]art\nHow [G]great thou [D7]art\n{eoc}\n\n{sov: Verse 1}\n[G]Amazing [D]grace\n{eov}\n\n{repeat: Chorus}     ← renders Chorus section\n{repeat: Chorus, 2}  ← labels it \"CHORUS × 2\"\n{repeat: Verse 1, 3} ← labels it \"VERSE 1 × 3\""
  }
]

export const SECTION_FLAG_DOCS: { flag: string; description: string; example: string }[] = [
  {
    flag: "attention",
    description: "Needs focus — easy section to fumble live.",
    example: "{sob: Bridge, attention}\n[Em]The [B]key changes here — stay [Am]focused\nCome [G]back to verse after\n{eob}"
  },
  {
    flag: "skip",
    description: "Optional section — can be omitted in shorter sets.",
    example: "{sov: Intro, skip}\n[G]Instrumental intro riff\n[G] / / / [C] / / /\n{eov}"
  },
  {
    flag: "forte",
    description: "Play loudly / with intensity.",
    example: "{soc: Chorus, forte}\n[G]How [G]great thou [C]art\nHow [G]great thou [D7]art\n{eoc}"
  },
  {
    flag: "piano",
    description: "Play softly / delicately.",
    example: "{sov: Verse 2, piano}\n[G]T'was [D]grace that taught my [Em]heart to fear\n{eov}"
  },
  {
    flag: "vamp",
    description: "Repeat freely until cue (common in jazz and gospel).",
    example: "{sov: Vamp, vamp}\n[G]Yeah [C]yeah [G]yeah\n[G] / [C] / [G] /\n{eov}"
  },
  {
    flag: "tag",
    description: "Tag ending — a short closing phrase played after the final chorus.",
    example: "{soc: Tag, tag}\n[G]How great, how [C]great\nHow [G]great thou [D7]art\n{eoc}"
  },
  {
    flag: "break",
    description: "Full-band rest or pause before continuing.",
    example: "{sob: Break, break}\n[G]  ←  full stop, let it ring\n{eob}"
  }
]
