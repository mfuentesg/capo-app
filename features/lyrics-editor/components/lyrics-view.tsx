"use client"

import { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
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
  Minimize2,
  Maximize2
} from "lucide-react"
import { useRouter } from "next/navigation"
import type { Song } from "@/types"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { useLyricsSettings } from "@/features/lyrics-editor"
import { RenderedSong } from "./rendered-song"
import { LazySongEditor, preloadSongEditor } from "./song-editor"
import { useTranslation } from "@/hooks/use-translation"
import { useUnsavedChangesGuard } from "@/hooks/use-unsaved-changes-guard"
import { createOverlayIds } from "@/lib/ui/stable-overlay-ids"
import { cn } from "@/lib/utils"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog"

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
}

export const LyricsView = forwardRef<LyricsViewHandle, LyricsViewProps>(function LyricsView({
  song,
  mode = "page",
  readOnly = false,
  onClose,
  onSaveLyrics,
  isSaving = false,
  initialSettings,
  onSettingsChange
}: LyricsViewProps,
  ref
) {
  const { t } = useTranslation()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isPreviewing, setIsPreviewing] = useState(false)
  const [hasInitializedEditor, setHasInitializedEditor] = useState(false)
  const [editedLyrics, setEditedLyrics] = useState(song.lyrics || "")
  const [savedLyrics, setSavedLyrics] = useState(song.lyrics || "")
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isMinimalist, setIsMinimalist] = useState(false)

  // Restore persisted minimalist preference after mount (SSR-safe: initialise false then read)
  useEffect(() => {
    try {
      const stored = localStorage.getItem("capo_lyrics_minimalist_view")
      if (stored !== null) setIsMinimalist(stored === "true")
    } catch {
      // localStorage unavailable
    }
  }, [])

  const setMinimalistView = useCallback((value: boolean) => {
    setIsMinimalist(value)
    try {
      localStorage.setItem("capo_lyrics_minimalist_view", String(value))
    } catch {
      // localStorage unavailable
    }
  }, [])

  const handleDiscard = useCallback(() => {
    setIsEditing(false)
    setIsPreviewing(false)
    setEditedLyrics(savedLyrics)
    setHasUnsavedChanges(false)
    if (onClose) {
      onClose()
    } else {
      router.back()
    }
  }, [savedLyrics, onClose, router])

  const { showPrompt, triggerClose, confirmDiscard, keepEditing } =
    useUnsavedChangesGuard(hasUnsavedChanges, { onDiscard: handleDiscard })

  useImperativeHandle(ref, () => ({ requestClose: triggerClose }), [triggerClose])

  const settingsPopoverIds = createOverlayIds(`lyrics-settings-${song.id}`)
  const isPanel = mode === "panel"
  const canEdit = !readOnly

  useEffect(() => {
    preloadSongEditor()
  }, [])

  const { font, transpose, capo, hasModifications, resetAll } = useLyricsSettings({
    initialFontSize: initialSettings?.fontSize ?? song.fontSize,
    initialTranspose: initialSettings?.transpose ?? song.transpose,
    initialCapo: initialSettings?.capo ?? song.capo,
    onSettingsChange
  })

  const handleEdit = () => {
    if (!canEdit) return
    setHasInitializedEditor(true)
    setIsEditing(true)
    setIsPreviewing(false)
    setEditedLyrics(savedLyrics)
  }

  const handleCancel = useCallback(() => {
    if (hasUnsavedChanges) {
      triggerClose()
    } else {
      setIsEditing(false)
      setIsPreviewing(false)
    }
  }, [hasUnsavedChanges, triggerClose])

  const handleSave = () => {
    onSaveLyrics?.(editedLyrics)
    setSavedLyrics(editedLyrics)
    setIsEditing(false)
    setIsPreviewing(false)
    setHasUnsavedChanges(false)
  }

  const handleLyricsChange = (value: string) => {
    if (!canEdit) return
    setEditedLyrics(value)
    setHasUnsavedChanges(value !== savedLyrics)
  }

  const togglePreview = () => {
    if (!canEdit || !isEditing) return
    setIsPreviewing((prev) => !prev)
  }

  const handleBack = useCallback(() => {
    if (hasUnsavedChanges) {
      triggerClose()
    } else if (onClose) {
      onClose()
    } else {
      router.back()
    }
  }, [hasUnsavedChanges, triggerClose, onClose, router])

  const settingsPopoverContent = (
    <div className="space-y-4">
      <div className="space-y-2">
        <h4 className="font-medium leading-none">{t.songs.lyrics.displaySettings}</h4>
        <p className="text-sm text-muted-foreground">
          {t.songs.lyrics.displaySettingsDescription}
        </p>
      </div>

      <Separator />

      {/* Font Size */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Type className="h-4 w-4" />
          <span className="text-sm font-medium">{t.songs.lyrics.fontSize}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={font.decrease}
            variant="outline"
            size="sm"
            disabled={font.isAtMin()}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-md min-w-20 justify-center">
            <Type className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-sm font-medium">{font.value.toFixed(2)}</span>
          </div>
          <Button
            onClick={font.increase}
            variant="outline"
            size="sm"
            disabled={font.isAtMax()}
          >
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
            <span className="text-xs text-muted-foreground">
              {t.songs.semitones}
            </span>
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
          <Button
            onClick={capo.decrease}
            variant="outline"
            size="sm"
            disabled={capo.isAtMin()}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-md min-w-20 justify-center">
            <Guitar className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-sm font-medium">{capo.display()}</span>
          </div>
          <Button
            onClick={capo.increase}
            variant="outline"
            size="sm"
            disabled={capo.isAtMax()}
          >
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
    </div>
  )

  return (
    <div className={cn("bg-background", isPanel ? "h-full" : "min-h-screen")}>
      <AlertDialog open={showPrompt} onOpenChange={(open) => !open && keepEditing()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.common.unsavedChanges}</AlertDialogTitle>
            <AlertDialogDescription>{t.common.discardChangesMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={keepEditing}>{t.common.keepEditing}</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={confirmDiscard}>
              {t.common.discard}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Header */}
      <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        {isMinimalist ? (
          /* Minimalist header — single compact line with all song info */
          <div className={cn("px-4 py-2", !isPanel && "container mx-auto")}>
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

              {/* All song info on one line */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {song.title}
                  {song.artist && (
                    <span className="text-muted-foreground font-normal"> · {song.artist}</span>
                  )}
                  {song.key && (
                    <span className="text-muted-foreground font-normal"> · {song.key}</span>
                  )}
                  {song.bpm > 0 && (
                    <span className="text-muted-foreground font-normal">
                      {" "}· {song.bpm} {t.songs.bpm}
                    </span>
                  )}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-0.5 shrink-0">
                {canEdit && isEditing ? (
                  <>
                    {hasUnsavedChanges && (
                      <span className="mr-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    )}
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
                      disabled={!hasUnsavedChanges || isSaving}
                      aria-label={t.common.save}
                    >
                      <Save className="h-3.5 w-3.5" />
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
                    <Popover>
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
                  </>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setMinimalistView(false)}
                  aria-label={t.songs.lyrics.standardView}
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* Full header */
          <div className={cn("px-4 py-4", !isPanel && "container mx-auto")}>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBack}
                  className="shrink-0"
                  aria-label={t.common.goBack}
                >
                  {onClose ? <X className="h-5 w-5" /> : <ArrowLeft className="h-5 w-5" />}
                </Button>
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl font-semibold truncate">{song.title}</h1>
                  <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="shrink-0">
                  {song.key}
                </Badge>
                <Badge variant="outline" className="shrink-0">
                  {song.bpm} {t.songs.bpm}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={() => setMinimalistView(true)}
                  aria-label={t.songs.lyrics.minimalistView}
                >
                  <Minimize2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Editing Actions */}
            {canEdit && isEditing && (
              <div className="mt-4 pt-4 border-t flex flex-wrap items-center gap-2">
                {hasUnsavedChanges && <Badge variant="secondary">{t.common.unsavedChanges}</Badge>}
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  {t.common.cancel}
                </Button>
                <Button variant={isPreviewing ? "secondary" : "outline"} size="sm" onClick={togglePreview}>
                  {isPreviewing ? (
                    <Pencil className="h-4 w-4 mr-2" />
                  ) : (
                    <Eye className="h-4 w-4 mr-2" />
                  )}
                  {isPreviewing ? t.common.edit : t.songs.preview}
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleSave}
                  disabled={!hasUnsavedChanges || isSaving}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {t.common.save}
                </Button>
              </div>
            )}

            {/* Controls - View Mode */}
            {!isEditing && (
              <div className="mt-4 pt-4 border-t flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                {/* Current Settings Display */}
                <div className="flex items-center gap-2 flex-wrap">
                  {!font.isAtDefault() && (
                    <Badge variant="secondary" className="gap-1">
                      <Type className="h-3 w-3" />
                      {font.value.toFixed(2)}
                    </Badge>
                  )}
                  {!transpose.isAtDefault() && (
                    <Badge variant="secondary" className="gap-1">
                      <Music2 className="h-3 w-3" />
                      {transpose.display()} {t.songs.semitones}
                    </Badge>
                  )}
                  {!capo.isAtDefault() && (
                    <Badge variant="secondary" className="gap-1">
                      <Guitar className="h-3 w-3" />
                      {capo.display()}
                    </Badge>
                  )}
                  {hasModifications() && (
                    <Button variant="ghost" size="sm" onClick={resetAll} className="h-7 px-2">
                      <X className="h-3.5 w-3.5 mr-1" />
                      {t.songs.reset}
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {canEdit && (
                    <Button variant="outline" size="sm" onClick={handleEdit} className="shrink-0">
                      <Pencil className="h-4 w-4 mr-2" />
                      {t.songs.editLyrics}
                    </Button>
                  )}

                  {/* Settings Button */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="relative"
                        id={settingsPopoverIds.triggerId}
                        aria-controls={settingsPopoverIds.contentId}
                      >
                        <Settings2 className="h-4 w-4 mr-2" />
                        {t.songs.lyrics.settings}
                        {hasModifications() && (
                          <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                          </span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto mr-2.5"
                      align="start"
                      id={settingsPopoverIds.contentId}
                      aria-labelledby={settingsPopoverIds.triggerId}
                    >
                      {settingsPopoverContent}
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}
          </div>
        )}
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
              <div className={cn(isEditing && isPreviewing ? "rounded-lg border bg-card p-4 md:p-6 overflow-hidden" : "block")}>
                <RenderedSong
                  lyrics={isEditing && isPreviewing ? editedLyrics : savedLyrics}
                  transpose={transpose.value}
                  capo={capo.value}
                  fontSize={font.value}
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
    </div>
  )
})
