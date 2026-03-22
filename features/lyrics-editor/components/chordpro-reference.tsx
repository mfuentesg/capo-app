"use client"

import { useState, useCallback } from "react"
import { Check, Copy } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useLocale } from "@/features/settings"
import { CHORDPRO_DIRECTIVES, SECTION_FLAG_DOCS, type ChordProDirective } from "../data/chordpro-directives"

interface ChordProReferenceProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type Category = ChordProDirective["category"]

const CATEGORY_ORDER: Category[] = ["metadata", "section", "comment", "chord", "formatting"]

// ─── Syntax highlighter ──────────────────────────────────────────────────────

type TokenType = "punctuation" | "keyword" | "string" | "chord" | "annotation" | "text"

interface Token {
  type: TokenType
  text: string
}

function tokenizeLine(line: string): Token[] {
  // Annotation: everything from ← to end of line is a comment/note
  const annotIdx = line.indexOf("←")
  const main = annotIdx >= 0 ? line.slice(0, annotIdx) : line
  const annot = annotIdx >= 0 ? line.slice(annotIdx) : null

  const tokens: Token[] = []
  let i = 0

  while (i < main.length) {
    // [ChordName]
    if (main[i] === "[") {
      const close = main.indexOf("]", i)
      if (close >= 0) {
        tokens.push({ type: "chord", text: main.slice(i, close + 1) })
        i = close + 1
        continue
      }
    }

    // {directive} or {directive: value}
    if (main[i] === "{") {
      const close = main.indexOf("}", i)
      if (close >= 0) {
        const inner = main.slice(i + 1, close)
        const colonIdx = inner.indexOf(":")
        tokens.push({ type: "punctuation", text: "{" })
        if (colonIdx >= 0) {
          tokens.push({ type: "keyword", text: inner.slice(0, colonIdx) })
          tokens.push({ type: "punctuation", text: ":" })
          tokens.push({ type: "string", text: inner.slice(colonIdx + 1) })
        } else {
          tokens.push({ type: "keyword", text: inner })
        }
        tokens.push({ type: "punctuation", text: "}" })
        i = close + 1
        continue
      }
    }

    // Collect plain text up to next special char
    let j = i
    while (j < main.length && main[j] !== "[" && main[j] !== "{") j++
    if (j > i) {
      tokens.push({ type: "text", text: main.slice(i, j) })
      i = j
    }
  }

  if (annot) tokens.push({ type: "annotation", text: annot })
  return tokens
}

const TOKEN_CLASS: Record<TokenType, string> = {
  chord: "[color:var(--chord)] font-semibold",
  keyword: "text-blue-600 dark:text-blue-300",
  string: "text-green-700 dark:text-green-400",
  punctuation: "text-foreground/40",
  annotation: "text-muted-foreground/60 italic",
  text: ""
}

function HighlightedCode({ code }: { code: string }) {
  return (
    <>
      {code.split("\n").map((line, li) => (
        <span key={li} className="block">
          {tokenizeLine(line).map((tok, ti) => (
            <span key={ti} className={TOKEN_CLASS[tok.type]}>
              {tok.text}
            </span>
          ))}
          {/* preserve blank lines */}
          {line === "" && <span> </span>}
        </span>
      ))}
    </>
  )
}

// ─── Copy button ─────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    // Strip ← annotations so only clean ChordPro is copied
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
      className="shrink-0 p-1 rounded text-muted-foreground/50 hover:text-muted-foreground hover:bg-white/10 transition-colors"
      aria-label="Copy"
    >
      {copied ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
    </button>
  )
}

// ─── Code block ──────────────────────────────────────────────────────────────

function CodeBlock({ code }: { code: string }) {
  return (
    <div className="relative group mt-2">
      <pre className="text-[11.5px] bg-[hsl(220_13%_18%)] dark:bg-[hsl(220_13%_11%)] text-[hsl(220_14%_71%)] dark:text-[hsl(220_14%_75%)] rounded-md px-3 pt-3 pb-3 pr-8 font-mono leading-[1.7] overflow-x-auto whitespace-pre">
        <HighlightedCode code={code} />
      </pre>
      <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <CopyButton text={code} />
      </div>
    </div>
  )
}

// ─── Directive entry ─────────────────────────────────────────────────────────

function DirectiveEntry({
  directive,
  shorthandLabel
}: {
  directive: ChordProDirective
  shorthandLabel: string
}) {
  return (
    <div className="py-3.5 border-b last:border-0">
      {/* Name + shorthand */}
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

      {/* Description */}
      <p className="text-[12px] text-muted-foreground leading-relaxed mb-0.5">
        {directive.description}
      </p>

      {/* Code block */}
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
      <p className="text-[12px] text-muted-foreground leading-relaxed mb-0.5">{description}</p>
      <CodeBlock code={example} />
    </div>
  )
}

// ─── Category heading ────────────────────────────────────────────────────────

function CategoryHeading({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mt-7 mb-1 first:mt-4">
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70 shrink-0">
        {label}
      </span>
      <div className="flex-1 h-px bg-border" />
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
      <SheetContent side="right" className="w-full sm:max-w-[420px] flex flex-col p-0">
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

          {/* Performance flags */}
          <section>
            <CategoryHeading label={t.songs.lyrics.reference.performanceFlags} />
            <p className="text-[12px] text-muted-foreground mb-2">
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
