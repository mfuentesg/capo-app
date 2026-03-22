"use client"

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react"
import { useUpsertUserPreferences } from "@/features/songs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  BookOpen,
  Music2,
  Type,
  Plus,
  Minus,
  Guitar,
  Settings2,
  X,
  Eye,
  Pencil,
  Save,
  Columns2,
  ExternalLink
} from "lucide-react"
import { useRouter } from "next/navigation"
import type { Song } from "@/types"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { useLyricsSettings } from "@/features/lyrics-editor"
import { RenderedSong } from "./rendered-song"
import { LazyChordProReference } from "./chordpro-reference-lazy"
import { LazySongEditor, preloadSongEditor } from "./song-editor"
import { useTranslation } from "@/hooks/use-translation"
import { useAutoSave } from "@/hooks/use-auto-save"
import { useAutoScroll } from "@/hooks/use-auto-scroll"
import { AutoScrollControls } from "./auto-scroll-controls"
import { SaveStatus } from "@/components/ui/save-status"
import { createOverlayIds } from "@/lib/ui/stable-overlay-ids"
import { cn } from "@/lib/utils"

export interface LyricsViewHandle {
  requestClose: () => void
}

interface LyricsViewProps {
  song: Song
  mode?: "page" | "panel"
  readOnly?: boolean
  onClose?: () => void
  onSaveLyrics?: (lyrics: string) => void
  isSaving?: boolean
  initialSettings?: { capo?: number; transpose?: number; fontSize?: number }
  onSettingsChange?: (settings: { capo: number; transpose: number; fontSize: number }) => void
  initialLyricsColumns?: 1 | 2
}

export const LyricsView = forwardRef<LyricsViewHandle, LyricsViewProps>(function LyricsView(
  {
    song,
    mode = "page",
    readOnly = false,
    onClose,
    onSaveLyrics,
    isSaving = false,
    initialSettings,
    onSettingsChange,
    initialLyricsColumns = 1
  }: LyricsViewProps,
  ref
) {
  const { t } = useTranslation()
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isPreviewing, setIsPreviewing] = useState(false)
  const [isReferenceOpen, setIsReferenceOpen] = useState(false)
  const [hasInitializedEditor, setHasInitializedEditor] = useState(false)
  const [editedLyrics, setEditedLyrics] = useState(song.lyrics || "")
  const [savedLyrics, setSavedLyrics] = useState(song.lyrics || "")
  const [lyricsColumns, setLyricsColumnsState] = useState<1 | 2>(initialLyricsColumns)
  const { mutate: upsertPreferences } = useUpsertUserPreferences()

  const MIN_SCROLL_SPEED = 10
  const MAX_SCROLL_SPEED = 300
  const SCROLL_SPEED_STEP = 10
  const DEFAULT_SCROLL_SPEED = 30
  const [scrollSpeed, setScrollSpeed] = useState(() =>
    song.bpm > 0 ? song.bpm : DEFAULT_SCROLL_SPEED
  )
  const { isScrolling, stop: stopAutoScroll, toggle: toggleAutoScroll } = useAutoScroll({
    speed: scrollSpeed,
    containerRef
  })

  const setLyricsColumns = useCallback(
    (value: 1 | 2) => {
      setLyricsColumnsState(value)
      upsertPreferences({ lyricsColumns: value })
    },
    [upsertPreferences]
  )

  const handleClose = useCallback(() => {
    if (onClose) {
      onClose()
    } else {
      router.back()
    }
  }, [onClose, router])

  // Auto-save lyrics while editing
  const { status: saveStatus } = useAutoSave(
    editedLyrics,
    async (lyrics) => {
      if (onSaveLyrics) {
        onSaveLyrics(lyrics)
        setSavedLyrics(lyrics)
      }
    },
    { enabled: isEditing && editedLyrics !== savedLyrics }
  )

  useImperativeHandle(ref, () => ({ requestClose: handleClose }), [handleClose])

  const settingsPopoverIds = createOverlayIds(`lyrics-settings-${song.id}`)
  const isPanel = mode === "panel"
  const canEdit = !readOnly

  useEffect(() => {
    preloadSongEditor()
  }, [])

  const { font, transpose, capo, hasModifications } = useLyricsSettings({
    initialFontSize: initialSettings?.fontSize ?? song.fontSize,
    initialTranspose: initialSettings?.transpose ?? song.transpose,
    initialCapo: initialSettings?.capo ?? song.capo,
    onSettingsChange
  })

  const handleEdit = () => {
    if (!canEdit) return
    stopAutoScroll()
    setHasInitializedEditor(true)
    setIsEditing(true)
    setIsPreviewing(false)
    setEditedLyrics(savedLyrics)
  }

  const handleCancel = useCallback(() => {
    setIsEditing(false)
    setIsPreviewing(false)
    setEditedLyrics(savedLyrics)
  }, [savedLyrics])

  const handleSave = () => {
    onSaveLyrics?.(editedLyrics)
    setSavedLyrics(editedLyrics)
    setIsEditing(false)
    setIsPreviewing(false)
  }

  const handleLyricsChange = (value: string) => {
    if (!canEdit) return
    setEditedLyrics(value)
  }

  const togglePreview = () => {
    if (!canEdit || !isEditing) return
    setIsPreviewing((prev) => !prev)
  }

  const handleBack = useCallback(() => {
    handleClose()
  }, [handleClose])

  // Reset scroll to top and auto-scroll speed when song changes
  useEffect(() => {
    if (containerRef.current) {
      const scrollContainer = containerRef.current.closest(".overflow-y-auto") || window
      scrollContainer.scrollTo({ top: 0 })
    }
    stopAutoScroll()
    setScrollSpeed(song.bpm > 0 ? song.bpm : DEFAULT_SCROLL_SPEED)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [song.id])

  const settingsPopoverContent = (
    <div className="space-y-4">
      <div className="space-y-2">
        <h4 className="font-medium leading-none">{t.songs.lyrics.displaySettings}</h4>
        <p className="text-sm text-muted-foreground">{t.songs.lyrics.displaySettingsDescription}</p>
      </div>

      <Separator />

      {/* Font Size */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Type className="h-4 w-4" />
          <span className="text-sm font-medium">{t.songs.lyrics.fontSize}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={font.decrease} variant="outline" size="sm" disabled={font.isAtMin()}>
            <Minus className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-md min-w-20 justify-center">
            <Type className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-sm font-medium">{font.value.toFixed(2)}</span>
          </div>
          <Button onClick={font.increase} variant="outline" size="sm" disabled={font.isAtMax()}>
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={font.reset}
            disabled={font.isAtDefault()}
            className="text-xs"
          >
            {t.songs.reset}
          </Button>
        </div>
      </div>

      <Separator />

      {/* Transpose */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Music2 className="h-4 w-4" />
          <span className="text-sm font-medium">{t.songs.transpose}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={transpose.decrease}
            variant="outline"
            size="sm"
            disabled={transpose.isAtMin()}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-md min-w-20 justify-center">
            <Music2 className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-sm font-medium">{transpose.display()}</span>
            <span className="text-xs text-muted-foreground">{t.songs.semitones}</span>
          </div>
          <Button
            onClick={transpose.increase}
            variant="outline"
            size="sm"
            disabled={transpose.isAtMax()}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={transpose.reset}
            disabled={transpose.isAtDefault()}
            className="text-xs"
          >
            {t.songs.reset}
          </Button>
        </div>
      </div>

      <Separator />

      {/* Capo */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Guitar className="h-4 w-4" />
          <span className="text-sm font-medium">{t.songs.capo}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={capo.decrease} variant="outline" size="sm" disabled={capo.isAtMin()}>
            <Minus className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-md min-w-20 justify-center">
            <Guitar className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-sm font-medium">{capo.display()}</span>
          </div>
          <Button onClick={capo.increase} variant="outline" size="sm" disabled={capo.isAtMax()}>
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={capo.reset}
            disabled={capo.isAtDefault()}
            className="text-xs"
          >
            {t.songs.reset}
          </Button>
        </div>
      </div>

      <Separator />

      {/* Column Layout */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Columns2 className="h-4 w-4" />
          <span className="text-sm font-medium">{t.songs.lyrics.columnLayout}</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={() => setLyricsColumns(1)}
            variant={lyricsColumns === 1 ? "default" : "outline"}
            size="sm"
            className="justify-center"
          >
            {t.songs.lyrics.oneColumn}
          </Button>
          <Button
            onClick={() => setLyricsColumns(2)}
            variant={lyricsColumns === 2 ? "default" : "outline"}
            size="sm"
            className="justify-center"
          >
            {t.songs.lyrics.twoColumns}
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <div ref={containerRef} className={cn("bg-background", isPanel ? "h-full" : "min-h-screen")}>
      {/* Header */}
      <div className="sticky top-0 z-10 border-b bg-background">
        <div className={cn("px-4 py-2", !isPanel && "container mx-auto")}>
          {/* Row 1: navigation + song info */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="h-8 w-8 shrink-0"
              aria-label={t.common.goBack}
            >
              {onClose ? <X className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
            </Button>

            <div className="flex-1 min-w-0 flex items-center gap-2 overflow-hidden">
              <p className="text-sm font-medium truncate shrink">
                {song.title}
                {song.artist && (
                  <span className="text-muted-foreground font-normal"> · {song.artist}</span>
                )}
              </p>
              {song.key && (
                <Badge variant="secondary" className="shrink-0 text-xs">
                  {song.key}
                </Badge>
              )}
              {song.bpm > 0 && (
                <Badge variant="outline" className="shrink-0 text-xs">
                  {song.bpm} {t.songs.bpm}
                </Badge>
              )}
            </div>
          </div>

          {/* Row 2: actions */}
          <div className="flex items-center gap-0.5 pl-10">
            {canEdit && isEditing ? (
                <>
                  <SaveStatus status={saveStatus} className="mr-1" />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleCancel}
                    aria-label={t.common.cancel}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant={isPreviewing ? "secondary" : "ghost"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={togglePreview}
                    aria-label={isPreviewing ? t.common.edit : t.songs.preview}
                  >
                    {isPreviewing ? (
                      <Pencil className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                  </Button>
                  <Button
                    variant="default"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleSave}
                    disabled={isSaving}
                    aria-label={t.common.save}
                  >
                    <Save className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setIsReferenceOpen(true)}
                    aria-label={t.songs.lyrics.chordproReference}
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                  </Button>
                </>
              ) : (
                <>
                  {canEdit && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={handleEdit}
                      aria-label={t.songs.editLyrics}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  <AutoScrollControls
                    isScrolling={isScrolling}
                    onToggle={toggleAutoScroll}
                    speed={scrollSpeed}
                    onIncrease={() =>
                      setScrollSpeed((s) => Math.min(s + SCROLL_SPEED_STEP, MAX_SCROLL_SPEED))
                    }
                    onDecrease={() =>
                      setScrollSpeed((s) => Math.max(s - SCROLL_SPEED_STEP, MIN_SCROLL_SPEED))
                    }
                    isAtMin={scrollSpeed <= MIN_SCROLL_SPEED}
                    isAtMax={scrollSpeed >= MAX_SCROLL_SPEED}
                  />
                  {isPanel && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      asChild
                      title={t.songs.viewLyrics}
                    >
                      <a
                        href={`/dashboard/songs/${song.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </Button>
                  )}
                  <Popover>
                    {" "}
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="relative h-8 w-8"
                        id={settingsPopoverIds.triggerId}
                        aria-controls={settingsPopoverIds.contentId}
                        aria-label={t.songs.lyrics.settings}
                      >
                        <Settings2 className="h-3.5 w-3.5" />
                        {hasModifications() && (
                          <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                          </span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto mr-2.5"
                      align="end"
                      id={settingsPopoverIds.contentId}
                      aria-labelledby={settingsPopoverIds.triggerId}
                    >
                      {settingsPopoverContent}
                    </PopoverContent>
                  </Popover>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setIsReferenceOpen(true)}
                    aria-label={t.songs.lyrics.chordproReference}
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                  </Button>
                </>
              )}
            </div>
        </div>
      </div>

      {/* Lyrics Content */}
      <div className={cn("px-4 py-8", !isPanel && "container mx-auto")}>
        <div className="w-full">
          <div className="max-w-5xl mx-auto">
            {isEditing && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  {isPreviewing ? t.songs.preview : t.songs.lyricsFormatInfo}
                </h3>
              </div>
            )}

            {(isPreviewing || !isEditing) && (
              <div
                className={cn(
                  isEditing && isPreviewing
                    ? "rounded-lg border bg-card p-4 md:p-6 overflow-hidden"
                    : "block"
                )}
              >
                <RenderedSong
                  lyrics={isEditing && isPreviewing ? editedLyrics : savedLyrics}
                  transpose={transpose.value}
                  capo={capo.value}
                  fontSize={font.value}
                  columns={lyricsColumns}
                />
              </div>
            )}

            {canEdit && hasInitializedEditor && (
              <div
                className={cn(
                  "rounded-lg border bg-card",
                  isEditing && !isPreviewing ? "block" : "hidden"
                )}
              >
                <LazySongEditor content={editedLyrics} onChange={handleLyricsChange} />
              </div>
            )}
          </div>
        </div>
      </div>
      <LazyChordProReference open={isReferenceOpen} onOpenChange={setIsReferenceOpen} />
    </div>
  )
})
