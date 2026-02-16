"use client"

import { useState } from "react"
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
  Pencil,
  Save
} from "lucide-react"
import { useRouter } from "next/navigation"
import type { Song } from "@/types"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { useLyricsSettings } from "@/features/lyrics-editor"
import { RenderedSong } from "./rendered-song"
import { LazySongEditor } from "./song-editor"
import { useTranslation } from "@/hooks/use-translation"
import { createOverlayIds } from "@/lib/ui/stable-overlay-ids"
import { cn } from "@/lib/utils"

interface LyricsViewProps {
  song: Song
  mode?: "page" | "panel"
  readOnly?: boolean
  onClose?: () => void
}

export function LyricsView({ song, mode = "page", readOnly = false, onClose }: LyricsViewProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [editedLyrics, setEditedLyrics] = useState(song.lyrics || "")
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const settingsPopoverIds = createOverlayIds(`lyrics-settings-${song.id}`)
  const isPanel = mode === "panel"
  const canEdit = !readOnly

  const { font, transpose, capo, hasModifications, resetAll } = useLyricsSettings({
    initialFontSize: song.fontSize,
    initialTranspose: song.transpose,
    initialCapo: song.capo
  })

  const handleEdit = () => {
    if (!canEdit) return
    setIsEditing(true)
    setEditedLyrics(song.lyrics || "")
  }

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      if (confirm(t.common.discardChangesMessage)) {
        setIsEditing(false)
        setEditedLyrics(song.lyrics || "")
        setHasUnsavedChanges(false)
      }
    } else {
      setIsEditing(false)
    }
  }

  const handleSave = () => {
    // TODO: Implement save to database
    // In real app, this would be an API call to update the song
    // For now, just update the UI state
    setIsEditing(false)
    setHasUnsavedChanges(false)
  }

  const handleLyricsChange = (value: string) => {
    if (!canEdit) return
    setEditedLyrics(value)
    setHasUnsavedChanges(value !== song.lyrics)
  }

  const handleBack = () => {
    if (onClose) {
      onClose()
      return
    }
    router.back()
  }

  return (
    <div className={cn("bg-background", isPanel ? "h-full" : "min-h-screen")}>
      {/* Header */}
      <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
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

              {/* Edit/View Toggle */}
              {canEdit &&
                (isEditing ? (
                  <>
                    {hasUnsavedChanges && (
                      <Badge variant="secondary" className="shrink-0">
                        {t.common.unsavedChanges}
                      </Badge>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancel}
                      className="shrink-0"
                    >
                      <X className="h-4 w-4 mr-2" />
                      {t.common.cancel}
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleSave}
                      disabled={!hasUnsavedChanges}
                      className="shrink-0"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {t.common.save}
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" size="sm" onClick={handleEdit} className="shrink-0">
                    <Pencil className="h-4 w-4 mr-2" />
                    {t.songs.editLyrics}
                  </Button>
                ))}
            </div>
          </div>

          {/* Controls - Only show in view mode */}
          {!isEditing && (
            <div className="mt-4 pt-4 border-t flex items-center justify-between gap-4">
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
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>
      </div>

      {/* Lyrics Content */}
      <div className={cn("px-4 py-8", !isPanel && "container mx-auto")}>
        <div className="w-full">
          {isEditing && canEdit ? (
            <div className="max-w-5xl mx-auto">
              <div className="mb-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  {t.songs.lyricsFormatInfo}
                </h3>
              </div>
              <div className="rounded-lg border bg-card overflow-hidden">
                <LazySongEditor content={editedLyrics} onChange={handleLyricsChange} />
              </div>
            </div>
          ) : (
            <RenderedSong
              lyrics={song.lyrics}
              transpose={transpose.value}
              capo={capo.value}
              fontSize={font.value}
            />
          )}
        </div>
      </div>
    </div>
  )
}
