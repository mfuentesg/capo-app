"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useLocale } from "@/features/settings"
import { CHORDPRO_DIRECTIVES, SECTION_FLAG_DOCS, type ChordProDirective } from "../data/chordpro-directives"

interface ChordProReferenceProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type Category = ChordProDirective["category"]

const CATEGORY_ORDER: Category[] = ["metadata", "section", "comment", "chord", "formatting"]

function DirectiveEntry({ directive, shorthandLabel }: { directive: ChordProDirective; shorthandLabel: string }) {
  return (
    <div className="py-3 border-b last:border-0">
      <div className="flex items-baseline gap-1.5 flex-wrap mb-1">
        <code className="text-[12px] font-mono font-semibold bg-muted px-1.5 py-0.5 rounded">
          {"{"}
          {directive.name}
          {"}"}
        </code>
        {directive.shorthand && (
          <>
            <span className="text-[11px] text-muted-foreground">{shorthandLabel}</span>
            <code className="text-[12px] font-mono font-semibold bg-muted px-1.5 py-0.5 rounded">
              {"{"}
              {directive.shorthand}
              {"}"}
            </code>
          </>
        )}
      </div>
      <p className="text-[12px] text-muted-foreground mb-2">{directive.description}</p>
      <pre className="text-[11px] bg-muted/60 rounded px-2.5 py-2 font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap">
        {directive.example}
      </pre>
    </div>
  )
}

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
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="px-4 pt-4 pb-3 border-b shrink-0">
          <SheetTitle className="text-base">{t.songs.lyrics.chordproReference}</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 pb-8">
          {grouped.map(({ category, label, directives }) => (
            <section key={category} className="mt-5">
              <h3 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                {label}
              </h3>
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

          {/* Performance flags section */}
          <section className="mt-5">
            <h3 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
              {t.songs.lyrics.reference.performanceFlags}
            </h3>
            <p className="text-[12px] text-muted-foreground mb-3">
              {t.songs.lyrics.reference.performanceFlagsDescription}
            </p>
            <div>
              {SECTION_FLAG_DOCS.map(({ flag, description, example }) => (
                <div key={flag} className="py-3 border-b last:border-0">
                  <div className="flex items-baseline gap-2 mb-1">
                    <code className="text-[12px] font-mono font-semibold bg-muted px-1.5 py-0.5 rounded">{flag}</code>
                  </div>
                  <p className="text-[12px] text-muted-foreground mb-2">{description}</p>
                  <pre className="text-[11px] bg-muted/60 rounded px-2.5 py-2 font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap">
                    {example}
                  </pre>
                </div>
              ))}
            </div>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  )
}
