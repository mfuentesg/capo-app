"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Plus, X, Pin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/hooks/use-translation"
import {
  type VisualLine,
  type ChordToken,
  parseToVisual,
  visualToChordPro,
  insertChordAt,
  updateTokenChord,
  appendChordToken,
  addLineAfter,
  removeLine
} from "../utils/chord-pro-visual"
import { ChordBuilder } from "./chord-builder"

interface ChordProVisualEditorProps {
  content: string
  onChange: (value: string) => void
}

type ActivePopover =
  | { kind: "edit"; lineIdx: number; tokenIdx: number }
  | { kind: "insert-end"; lineIdx: number }
  | { kind: "insert-split"; lineIdx: number; tokenIdx: number; charOffset: number }

export function ChordProVisualEditor({ content, onChange }: ChordProVisualEditorProps) {
  const { t } = useTranslation()
  const [lines, setLines] = useState<VisualLine[]>(() => parseToVisual(content))
  const [activePopover, setActivePopover] = useState<ActivePopover | null>(null)
  // Track the last serialized value so we don't re-parse our own changes
  const lastEmitted = useRef<string>(content)

  useEffect(() => {
    if (content !== lastEmitted.current) {
      setLines(parseToVisual(content))
      lastEmitted.current = content
    }
  }, [content])

  const commit = useCallback(
    (newLines: VisualLine[]) => {
      setLines(newLines)
      const serialized = visualToChordPro(newLines)
      lastEmitted.current = serialized
      onChange(serialized)
    },
    [onChange]
  )

  // ── Popover helpers ────────────────────────────────────────────────────────

  const closePopover = () => setActivePopover(null)

  const handleChordConfirm = (chord: string) => {
    if (!activePopover) return

    if (activePopover.kind === "edit") {
      commit(updateTokenChord(lines, activePopover.lineIdx, activePopover.tokenIdx, chord))
    } else if (activePopover.kind === "insert-end") {
      commit(appendChordToken(lines, activePopover.lineIdx, chord))
    } else if (activePopover.kind === "insert-split") {
      commit(
        insertChordAt(
          lines,
          activePopover.lineIdx,
          activePopover.tokenIdx,
          activePopover.charOffset,
          chord
        )
      )
    }
    closePopover()
  }

  const handleChordRemove = () => {
    if (!activePopover || activePopover.kind !== "edit") return
    commit(updateTokenChord(lines, activePopover.lineIdx, activePopover.tokenIdx, null))
    closePopover()
  }

  // ── Lyric click → split token ─────────────────────────────────────────────

  // Receives the pre-computed offset from TokenBlock
  const handleLyricClick = (lineIdx: number, tokenIdx: number, offset: number | null) => {
    if (offset === null) {
      // Empty lyric on a chord-only token — open edit for that token's chord
      setActivePopover({ kind: "edit", lineIdx, tokenIdx })
    } else {
      setActivePopover({ kind: "insert-split", lineIdx, tokenIdx, charOffset: offset })
    }
  }

  // ── Line management ────────────────────────────────────────────────────────

  const handleAddLine = (afterIdx: number) => {
    commit(addLineAfter(lines, afterIdx))
  }

  const handleRemoveLine = (idx: number) => {
    commit(removeLine(lines, idx))
  }

  // ── Current chord value for the active popover ─────────────────────────────

  const activeChordValue = (() => {
    if (!activePopover) return null
    if (activePopover.kind === "edit") {
      const line = lines[activePopover.lineIdx]
      if (line?.type === "chord-lyric") {
        return line.tokens[activePopover.tokenIdx]?.chord ?? null
      }
    }
    return null
  })()

  return (
    <div className="p-4 space-y-1 min-h-[400px] font-mono">
      {lines.map((line: VisualLine, lineIdx: number) => (
        <LineRow
          key={lineIdx}
          line={line}
          lineIdx={lineIdx}
          showRemove={lines.length > 1}
          activePopover={activePopover}
          activeChordValue={activeChordValue}
          onChordClick={(tokenIdx: number) =>
            setActivePopover({ kind: "edit", lineIdx, tokenIdx })
          }
          onAddChordAtEnd={() => setActivePopover({ kind: "insert-end", lineIdx })}
          onLyricClick={(tokenIdx: number, offset: number | null) =>
            handleLyricClick(lineIdx, tokenIdx, offset)
          }
          onAddLine={() => handleAddLine(lineIdx)}
          onRemoveLine={() => handleRemoveLine(lineIdx)}
          onChordConfirm={handleChordConfirm}
          onChordRemove={handleChordRemove}
          onPopoverClose={closePopover}
          t={t}
        />
      ))}

      {/* Global add-line button at the bottom */}
      <div className="pt-2">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground text-xs"
          onClick={() => handleAddLine(lines.length - 1)}
        >
          <Plus className="h-3 w-3 mr-1" />
          {t.songs.lyrics.chordBuilder.addLine}
        </Button>
      </div>
    </div>
  )
}

// ── Sub-component: one line ───────────────────────────────────────────────────

interface LineRowProps {
  line: VisualLine
  lineIdx: number
  showRemove: boolean
  activePopover: ActivePopover | null
  activeChordValue: string | null
  onChordClick: (tokenIdx: number) => void
  onAddChordAtEnd: () => void
  onLyricClick: (tokenIdx: number, offset: number | null) => void
  onAddLine: () => void
  onRemoveLine: () => void
  onChordConfirm: (chord: string) => void
  onChordRemove: () => void
  onPopoverClose: () => void
  t: ReturnType<typeof useTranslation>["t"]
}

function LineRow({
  line,
  lineIdx,
  showRemove,
  activePopover,
  activeChordValue,
  onChordClick,
  onAddChordAtEnd,
  onLyricClick,
  onAddLine,
  onRemoveLine,
  onChordConfirm,
  onChordRemove,
  onPopoverClose,
  t
}: LineRowProps) {
  if (line.type === "empty") {
    return (
      <EmptyLineRow
        lineIdx={lineIdx}
        showRemove={showRemove}
        onAddLine={onAddLine}
        onRemoveLine={onRemoveLine}
        t={t}
      />
    )
  }

  if (line.type === "directive") {
    return (
      <DirectiveLineRow
        raw={line.raw}
        lineIdx={lineIdx}
        showRemove={showRemove}
        onAddLine={onAddLine}
        onRemoveLine={onRemoveLine}
        t={t}
      />
    )
  }

  // chord-lyric line
  return (
    <ChordLyricLineRow
      tokens={line.tokens}
      lineIdx={lineIdx}
      showRemove={showRemove}
      activePopover={activePopover}
      activeChordValue={activeChordValue}
      onChordClick={onChordClick}
      onAddChordAtEnd={onAddChordAtEnd}
      onLyricClick={onLyricClick}
      onAddLine={onAddLine}
      onRemoveLine={onRemoveLine}
      onChordConfirm={onChordConfirm}
      onChordRemove={onChordRemove}
      onPopoverClose={onPopoverClose}
      t={t}
    />
  )
}

// ── Chord-lyric line ──────────────────────────────────────────────────────────

interface ChordLyricLineRowProps {
  tokens: ChordToken[]
  lineIdx: number
  showRemove: boolean
  activePopover: ActivePopover | null
  activeChordValue: string | null
  onChordClick: (tokenIdx: number) => void
  onAddChordAtEnd: () => void
  onLyricClick: (tokenIdx: number, offset: number | null) => void
  onAddLine: () => void
  onRemoveLine: () => void
  onChordConfirm: (chord: string) => void
  onChordRemove: () => void
  onPopoverClose: () => void
  t: ReturnType<typeof useTranslation>["t"]
}

function ChordLyricLineRow({
  tokens,
  lineIdx,
  showRemove,
  activePopover,
  activeChordValue,
  onChordClick,
  onAddChordAtEnd,
  onLyricClick,
  onAddLine,
  onRemoveLine,
  onChordConfirm,
  onChordRemove,
  onPopoverClose,
  t
}: ChordLyricLineRowProps) {
  const isAddEndOpen =
    activePopover?.kind === "insert-end" && activePopover.lineIdx === lineIdx

  return (
    <div className="group relative flex items-stretch gap-2">
      {/* Main token area */}
      <div className="flex-1 border rounded-md px-2 py-1.5 bg-card min-h-[56px]">
        <div className="flex flex-wrap items-end gap-x-0">
          {tokens.map((token: ChordToken, tokenIdx: number) => {
            const isEditOpen =
              activePopover?.kind === "edit" &&
              activePopover.lineIdx === lineIdx &&
              activePopover.tokenIdx === tokenIdx

            const isSplitOpen =
              activePopover?.kind === "insert-split" &&
              activePopover.lineIdx === lineIdx &&
              activePopover.tokenIdx === tokenIdx

            return (
              <TokenBlock
                key={tokenIdx}
                token={token}
                isEditOpen={isEditOpen}
                isSplitOpen={isSplitOpen}
                activeChordValue={activeChordValue}
                onChordClick={() => onChordClick(tokenIdx)}
                onLyricClick={(offset: number | null) => onLyricClick(tokenIdx, offset)}
                onChordConfirm={onChordConfirm}
                onChordRemove={onChordRemove}
                onPopoverClose={onPopoverClose}
                t={t}
              />
            )
          })}

          {/* Add chord at end of line */}
          <Popover
            open={isAddEndOpen}
            onOpenChange={(open: boolean) => !open && onPopoverClose()}
          >
            <PopoverTrigger asChild>
              <button
                className="self-start mt-px text-xs text-muted-foreground hover:text-primary px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity leading-5"
                onClick={onAddChordAtEnd}
                aria-label={t.songs.lyrics.chordBuilder.addChord}
              >
                +
              </button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-auto" align="start">
              <ChordBuilder
                value={null}
                onConfirm={onChordConfirm}
                onRemove={onChordRemove}
                onCancel={onPopoverClose}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Line controls */}
      <LineControls
        showRemove={showRemove}
        onAddLine={onAddLine}
        onRemoveLine={onRemoveLine}
        t={t}
      />
    </div>
  )
}

// ── Single token block (chord badge + lyric span) ─────────────────────────────

interface TokenBlockProps {
  token: ChordToken
  isEditOpen: boolean
  isSplitOpen: boolean
  activeChordValue: string | null
  onChordClick: () => void
  // offset=null means the lyric was empty → treat as chord slot click
  onLyricClick: (offset: number | null) => void
  onChordConfirm: (chord: string) => void
  onChordRemove: () => void
  onPopoverClose: () => void
  t: ReturnType<typeof useTranslation>["t"]
}

function TokenBlock({
  token,
  isEditOpen,
  isSplitOpen,
  activeChordValue,
  onChordClick,
  onLyricClick,
  onChordConfirm,
  onChordRemove,
  onPopoverClose,
  t
}: TokenBlockProps) {
  // Compute click character offset from the native click event
  const handleLyricSpanClick = (e: { clientX: number; currentTarget: HTMLSpanElement }) => {
    const el = e.currentTarget
    const text = el.textContent ?? ""
    const trimmed = text.replace(/\u00A0/g, "")

    if (!trimmed) {
      onLyricClick(null)
      return
    }

    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left
    const charWidth = rect.width / trimmed.length
    const offset = Math.min(Math.max(0, Math.round(x / charWidth)), trimmed.length)
    onLyricClick(offset)
  }

  return (
    <div className="inline-flex flex-col items-start">
      {/* Chord row */}
      {token.chord ? (
        <Popover open={isEditOpen} onOpenChange={(open: boolean) => !open && onPopoverClose()}>
          <PopoverTrigger asChild>
            <button
              className="text-xs font-bold text-primary hover:bg-primary/10 px-1 rounded leading-5 whitespace-nowrap"
              onClick={onChordClick}
            >
              {token.chord}
            </button>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-auto" align="start">
            <ChordBuilder
              value={activeChordValue}
              onConfirm={onChordConfirm}
              onRemove={onChordRemove}
              onCancel={onPopoverClose}
            />
          </PopoverContent>
        </Popover>
      ) : (
        <div className="h-5" />
      )}

      {/* Lyric row — clicking opens insert-split popover */}
      <Popover
        open={isSplitOpen}
        onOpenChange={(open: boolean) => !open && onPopoverClose()}
      >
        <PopoverTrigger asChild>
          <span
            className={cn(
              "text-sm whitespace-pre cursor-text select-none rounded px-0.5 leading-6 min-w-[0.75rem] min-h-[1.5rem] inline-block",
              "hover:bg-muted/60 transition-colors"
            )}
            onClick={handleLyricSpanClick}
            title={t.songs.lyrics.chordBuilder.addChord}
          >
            {token.lyric || "\u00A0"}
          </span>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-auto" align="start">
          <ChordBuilder
            value={null}
            onConfirm={onChordConfirm}
            onRemove={onChordRemove}
            onCancel={onPopoverClose}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

// ── Empty line ────────────────────────────────────────────────────────────────

function EmptyLineRow({
  lineIdx: _lineIdx,
  showRemove,
  onAddLine,
  onRemoveLine,
  t
}: {
  lineIdx: number
  showRemove: boolean
  onAddLine: () => void
  onRemoveLine: () => void
  t: ReturnType<typeof useTranslation>["t"]
}) {
  return (
    <div className="group flex items-center gap-2">
      <div className="flex-1 border border-dashed rounded-md h-8 bg-transparent" />
      <LineControls showRemove={showRemove} onAddLine={onAddLine} onRemoveLine={onRemoveLine} t={t} />
    </div>
  )
}

// ── Directive line ────────────────────────────────────────────────────────────

function DirectiveLineRow({
  raw,
  lineIdx: _lineIdx,
  showRemove,
  onAddLine,
  onRemoveLine,
  t
}: {
  raw: string
  lineIdx: number
  showRemove: boolean
  onAddLine: () => void
  onRemoveLine: () => void
  t: ReturnType<typeof useTranslation>["t"]
}) {
  return (
    <div className="group flex items-center gap-2">
      <div className="flex-1 flex items-center gap-1.5 border rounded-md px-2 py-1 bg-muted/40 text-muted-foreground text-xs">
        <Pin className="h-3 w-3 shrink-0" />
        <span className="font-mono truncate">{raw}</span>
      </div>
      <LineControls showRemove={showRemove} onAddLine={onAddLine} onRemoveLine={onRemoveLine} t={t} />
    </div>
  )
}

// ── Shared line controls ──────────────────────────────────────────────────────

function LineControls({
  showRemove,
  onAddLine,
  onRemoveLine,
  t
}: {
  showRemove: boolean
  onAddLine: () => void
  onRemoveLine: () => void
  t: ReturnType<typeof useTranslation>["t"]
}) {
  return (
    <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={onAddLine}
        aria-label={t.songs.lyrics.chordBuilder.addLine}
      >
        <Plus className="h-3 w-3" />
      </Button>
      {showRemove && (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-destructive hover:text-destructive"
          onClick={onRemoveLine}
          aria-label={t.songs.lyrics.chordBuilder.removeLine}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  )
}
