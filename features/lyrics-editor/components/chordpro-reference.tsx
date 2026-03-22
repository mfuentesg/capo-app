"use client"

import { useState, useCallback } from "react"
import { Check, Copy } from "lucide-react"
import CodeMirror from "@uiw/react-codemirror"
import { EditorView } from "@codemirror/view"
import { EditorState } from "@codemirror/state"
import { useTheme } from "next-themes"
import { catppuccinLatte, catppuccinMocha } from "@catppuccin/codemirror"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useLocale } from "@/features/settings"
import { chordProDisplayExtensions } from "../utils/chordpro-lang"
import { CHORDPRO_DIRECTIVES, SECTION_FLAG_DOCS, type ChordProDirective } from "../data/chordpro-directives"

interface ChordProReferenceProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type Category = ChordProDirective["category"]

const CATEGORY_ORDER: Category[] = ["metadata", "section", "comment", "chord", "formatting"]

// Module-level: created once, shared across all code block instances.
const miniEditorStyle = EditorView.theme({
  "&": { fontSize: "12px" },
  ".cm-content": {
    padding: "10px 0",
    fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
    lineHeight: "1.7"
  },
  ".cm-line": { padding: "0 12px" },
  ".cm-editor": { outline: "none" },
  ".cm-scroller": { overflow: "auto" }
})

const readOnlyExtensions = [
  ...chordProDisplayExtensions(),
  EditorView.editable.of(false),
  EditorState.readOnly.of(true),
  EditorView.lineWrapping,
  miniEditorStyle
]

const miniBasicSetup = {
  lineNumbers: false,
  foldGutter: false,
  highlightActiveLine: false,
  autocompletion: false,
  highlightActiveLineGutter: false,
  indentOnInput: false,
  searchKeymap: false
}

// ─── Copy button ─────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    // Strip ← annotation comments so only clean ChordPro is copied
    const clean = text
      .split("\n")
      .map((line) => {
        const idx = line.indexOf("←")
        return idx >= 0 ? line.slice(0, idx).trimEnd() : line
      })
      .join("\n")
      .trim()

    navigator.clipboard.writeText(clean).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }, [text])

  return (
    <button
      onClick={handleCopy}
      className="flex items-center justify-center h-6 w-6 rounded bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors border border-border/40"
      aria-label="Copy"
    >
      {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
    </button>
  )
}

// ─── Code block ──────────────────────────────────────────────────────────────

function CodeBlock({ code }: { code: string }) {
  const { resolvedTheme } = useTheme()

  return (
    <div className="relative mt-2">
      <div className="rounded-md overflow-hidden border border-border/50 text-[12px]">
        <CodeMirror
          value={code}
          theme={resolvedTheme === "dark" ? catppuccinMocha : catppuccinLatte}
          extensions={readOnlyExtensions}
          basicSetup={miniBasicSetup}
        />
      </div>
      {/* Copy button always visible, top-right corner */}
      <div className="absolute top-1.5 right-1.5">
        <CopyButton text={code} />
      </div>
    </div>
  )
}

// ─── Category heading ─────────────────────────────────────────────────────────

function CategoryHeading({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mt-7 mb-0.5 first:mt-4">
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70 shrink-0">
        {label}
      </span>
      <div className="flex-1 h-px bg-border" />
    </div>
  )
}

// ─── Directive entry ──────────────────────────────────────────────────────────

function DirectiveEntry({
  directive,
  shorthandLabel
}: {
  directive: ChordProDirective
  shorthandLabel: string
}) {
  return (
    <div className="py-3.5 border-b last:border-0">
      <div className="flex items-center gap-2 flex-wrap mb-1.5">
        <code className="text-[12px] font-mono font-semibold bg-muted/80 border border-border/50 px-1.5 py-0.5 rounded text-blue-600 dark:text-blue-300">
          {"{"}
          {directive.name}
          {"}"}
        </code>
        {directive.shorthand && (
          <>
            <span className="text-[11px] text-muted-foreground/60">{shorthandLabel}</span>
            <code className="text-[12px] font-mono font-semibold bg-muted/80 border border-border/50 px-1.5 py-0.5 rounded text-blue-600 dark:text-blue-300">
              {"{"}
              {directive.shorthand}
              {"}"}
            </code>
          </>
        )}
      </div>
      <p className="text-[12px] text-muted-foreground leading-relaxed">{directive.description}</p>
      <CodeBlock code={directive.example} />
    </div>
  )
}

// ─── Flag entry ───────────────────────────────────────────────────────────────

function FlagEntry({ flag, description, example }: { flag: string; description: string; example: string }) {
  return (
    <div className="py-3.5 border-b last:border-0">
      <div className="flex items-center gap-2 mb-1.5">
        <code className="text-[12px] font-mono font-semibold bg-muted/80 border border-border/50 px-1.5 py-0.5 rounded text-green-700 dark:text-green-400">
          {flag}
        </code>
      </div>
      <p className="text-[12px] text-muted-foreground leading-relaxed">{description}</p>
      <CodeBlock code={example} />
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ChordProReference({ open, onOpenChange }: ChordProReferenceProps) {
  const { t } = useLocale()

  const categoryLabel: Record<Category, string> = {
    metadata: t.songs.lyrics.reference.metadata,
    section: t.songs.lyrics.reference.section,
    comment: t.songs.lyrics.reference.comment,
    chord: t.songs.lyrics.reference.chord,
    formatting: t.songs.lyrics.reference.formatting
  }

  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    label: categoryLabel[cat],
    directives: CHORDPRO_DIRECTIVES.filter((d) => d.category === cat)
  }))

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-[440px] flex flex-col p-0">
        <SheetHeader className="px-4 pt-4 pb-3 border-b shrink-0">
          <SheetTitle className="text-sm font-semibold">{t.songs.lyrics.chordproReference}</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 pb-10">
          {grouped.map(({ category, label, directives }) => (
            <section key={category}>
              <CategoryHeading label={label} />
              <div>
                {directives.map((directive) => (
                  <DirectiveEntry
                    key={directive.name}
                    directive={directive}
                    shorthandLabel={t.songs.lyrics.reference.shorthand}
                  />
                ))}
              </div>
            </section>
          ))}

          <section>
            <CategoryHeading label={t.songs.lyrics.reference.performanceFlags} />
            <p className="text-[12px] text-muted-foreground mb-2 mt-1">
              {t.songs.lyrics.reference.performanceFlagsDescription}
            </p>
            <div>
              {SECTION_FLAG_DOCS.map(({ flag, description, example }) => (
                <FlagEntry key={flag} flag={flag} description={description} example={example} />
              ))}
            </div>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  )
}
