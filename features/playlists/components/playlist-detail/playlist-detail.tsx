"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import {
  X,
  Calendar as CalendarIcon,
  Pencil,
  Check,
  Trash2,
  Plus,
  ListMusic,
  Globe,
  Copy,
  ExternalLink,
  ChevronUp,
  ChevronDown
} from "lucide-react"
import { toast } from "sonner"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog"
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent
} from "@/components/ui/empty"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { cn, formatLongDate, formatDateISO, parseDateValue } from "@/lib/utils"
import { useTranslation } from "@/hooks/use-translation"
import { useLocale } from "@/features/settings"
import { LyricsView } from "@/features/lyrics-editor"
import type { Playlist } from "@/features/playlists/types"
import type { SongWithPosition, PlaylistWithSongs } from "@/types/extended"
import { DraggablePlaylist } from "@/features/playlists/utils"
import { useReorderPlaylistSongs, usePlaylistSongs, usePlaylistRealtime } from "../../hooks"
import { playlistsKeys } from "../../hooks/query-keys"
import { removeSongFromPlaylistAction } from "../../api/actions"
import { createOverlayIds } from "@/lib/ui/stable-overlay-ids"
import { AddSongsSheet } from "./add-songs-sheet"

interface PlaylistDetailProps {
  playlist: Playlist
  onClose: () => void
  onUpdate: (playlistId: string, updates: Partial<Playlist>) => void
  onDelete: (playlistId: string) => void
}

function EditableField({
  value,
  onSave,
  className,
  inputClassName,
  multiline = false,
  allowEmpty = false,
  label
}: {
  value: string
  onSave: (value: string) => void
  className?: string
  inputClassName?: string
  multiline?: boolean
  allowEmpty?: boolean
  label?: string
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      if (!multiline) {
        ;(inputRef.current as HTMLInputElement).select()
      }
    }
  }, [isEditing, multiline])

  const handleSave = () => {
    const trimmed = editValue.trim()
    if (trimmed !== value && (trimmed || allowEmpty)) {
      onSave(trimmed)
    } else {
      setEditValue(value)
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !multiline) {
      handleSave()
    } else if (e.key === "Escape") {
      setEditValue(value)
      setIsEditing(false)
    }
  }

  if (isEditing) {
    return (
      <div className="flex items-start gap-1.5">
        {multiline ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            className={cn("min-h-20 px-2 py-1 border rounded resize-none", inputClassName)}
            rows={3}
          />
        ) : (
          <Input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            className={cn("h-8 px-2", inputClassName)}
          />
        )}
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 shrink-0"
          onClick={handleSave}
          aria-label="Save"
        >
          <Check className="h-5 w-5 text-green-600" />
        </Button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setIsEditing(true)}
      className={cn(
        "group inline-flex items-center gap-1.5 rounded px-1 -ml-1 hover:bg-muted transition-colors text-left",
        className
      )}
    >
      <span className={multiline ? "whitespace-pre-wrap" : "truncate"}>{value || label}</span>
      <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity shrink-0" />
    </button>
  )
}

export function PlaylistDetail({ playlist, onClose, onUpdate, onDelete }: PlaylistDetailProps) {
  usePlaylistRealtime(playlist.id)
  const reorderMutation = useReorderPlaylistSongs()
  const { data: playlistWithSongsData } = usePlaylistSongs(playlist.id)
  const { t } = useTranslation()
  const { locale } = useLocale()
  const queryClient = useQueryClient()
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [isAddSongsOpen, setIsAddSongsOpen] = useState(false)
  const bodyOverflowRef = useRef<string>("")
  const deleteDialogIds = createOverlayIds(`playlist-detail-delete-${playlist.id}`)
  const calendarPopoverIds = createOverlayIds(`playlist-detail-calendar-${playlist.id}`)

  const songsWithPosition = useMemo<SongWithPosition[]>(
    () =>
      (playlistWithSongsData?.songs ?? []).map((song, index) => ({ ...song, position: index })),
    [playlistWithSongsData]
  )

  const playlistWithSongs = useMemo<PlaylistWithSongs>(
    () => ({
      ...playlist,
      songs: songsWithPosition
    }),
    [playlist, songsWithPosition]
  )

  const removeSongMutation = useMutation({
    mutationFn: (songId: string) => removeSongFromPlaylistAction(playlist.id, songId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playlistsKeys.lists() })
      queryClient.invalidateQueries({ queryKey: playlistsKeys.detail(playlist.id) })
      toast.success(t.toasts.songDeleted)
    },
    onError: () => {
      toast.error(t.toasts?.error || "Something went wrong")
    }
  })

  useEffect(() => {
    if (activeIndex === null) return
    bodyOverflowRef.current = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = bodyOverflowRef.current
    }
  }, [activeIndex])

  const activeSong = activeIndex !== null ? songsWithPosition[activeIndex] : null
  const totalSongs = songsWithPosition.length

  const handleSongReorder = async (sourceIndex: number, destinationIndex: number) => {
    reorderMutation.mutate({
      playlistId: playlist.id,
      sourceIndex,
      destinationIndex,
      currentSongs: songsWithPosition.map((s) => s.id)
    })
  }

  const handleVisibilityChange = (checked: boolean) => {
    if (!checked && playlist.allowGuestEditing) {
      onUpdate(playlist.id, { visibility: "private", allowGuestEditing: false })
    } else {
      onUpdate(playlist.id, { visibility: checked ? "public" : "private" })
    }
  }

  return (
    <div className="flex flex-1 flex-col bg-muted/30">
      <div className="shrink-0 flex flex-col border-b bg-background p-4 lg:p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <EditableField
              value={playlist.name}
              onSave={(value) => onUpdate(playlist.id, { name: value })}
              className="text-lg font-semibold"
              label={t.common.clickToAdd}
            />
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label={t.common.close}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <EditableField
          value={playlist.description || ""}
          onSave={(value) => onUpdate(playlist.id, { description: value || undefined })}
          className="text-sm text-muted-foreground mt-1"
          inputClassName="text-sm"
          multiline
          allowEmpty
          label={t.playlistDetail.addDescription}
        />
      </div>

      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
        {/* Details Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium">{t.playlistDetail.details}</h3>
          <div className="flex flex-wrap gap-2">
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  id={calendarPopoverIds.triggerId}
                  aria-controls={calendarPopoverIds.contentId}
                  className={cn(
                    "flex items-center gap-2 rounded-full bg-background border px-3 py-1.5 h-auto font-normal",
                    !playlist.date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="h-3.5 w-3.5" />
                  {playlist.date
                    ? formatLongDate(playlist.date, locale)
                    : t.playlistDetail.pickDate}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0"
                align="start"
                id={calendarPopoverIds.contentId}
                aria-labelledby={calendarPopoverIds.triggerId}
              >
                <Calendar
                  mode="single"
                  selected={playlist.date ? parseDateValue(playlist.date) : undefined}
                  onSelect={(date) => {
                    if (date) {
                      onUpdate(playlist.id, { date: formatDateISO(date) })
                      setIsCalendarOpen(false)
                    }
                  }}
                  autoFocus
                />
              </PopoverContent>
            </Popover>
            <div className="flex items-center gap-2 rounded-full bg-background border px-3 py-1.5">
              <ListMusic className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-sm font-medium">{playlist.songs.length}</span>
              <span className="text-xs text-muted-foreground">
                {playlist.songs.length === 1 ? t.playlistDetail.song : t.playlistDetail.songsPlural}
              </span>
            </div>
          </div>
        </div>

        {/* Privacy Settings Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium">{t.playlistDetail.privacySharing}</h3>
          <div className="space-y-3 max-w-md">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5 flex-1">
                <label className="text-sm font-medium">{t.playlistDetail.publicVisibility}</label>
                <p className="text-xs text-muted-foreground">
                  <Globe className="h-3 w-3 inline mr-1" />
                  {t.playlistDetail.anyoneWithLink}
                </p>
              </div>
              <Switch
                checked={playlist.visibility === "public"}
                onCheckedChange={handleVisibilityChange}
              />
            </div>
            {playlist.visibility === "public" && playlist.shareCode && (
              <div className="space-y-2">
                <p className="text-xs font-medium">{t.playlistDetail.publicUrl}</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-muted px-2 py-1.5 rounded text-xs font-mono">
                    {playlist.shareCode}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `${window.location.origin}/shared/${playlist.shareCode}`
                      )
                      toast.success(t.playlistDetail.copied)
                    }}
                  >
                    <Copy className="h-3 w-3" />
                    {t.playlistDetail.copy}
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <a
                      href={`/shared/${playlist.shareCode}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">{t.playlistDetail.guestEditing}</label>
                <p className="text-xs text-muted-foreground">
                  {playlist.visibility !== "public"
                    ? t.playlistDetail.guestEditingDisabledHint
                    : t.playlistDetail.guestsCanReorder}
                </p>
              </div>
              <Switch
                checked={playlist.allowGuestEditing || false}
                disabled={playlist.visibility !== "public"}
                onCheckedChange={(checked) => {
                  onUpdate(playlist.id, { allowGuestEditing: checked })
                }}
              />
            </div>
          </div>
        </div>

        {/* Songs Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium">{t.playlistDetail.songs}</h3>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setIsAddSongsOpen(true)}
            >
              <Plus className="h-3.5 w-3.5" />
              {t.playlistDetail.addSongsButton}
            </Button>
          </div>
          {playlist.songs.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ListMusic />
                </EmptyMedia>
                <EmptyTitle>{t.playlistDetail.noSongsInPlaylist}</EmptyTitle>
                <EmptyDescription>{t.playlistDetail.addSongsDescription}</EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => setIsAddSongsOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                  {t.playlistDetail.addSongsButton}
                </Button>
              </EmptyContent>
            </Empty>
          ) : (
            <DraggablePlaylist
              playlist={playlistWithSongs}
              songs={songsWithPosition}
              onPlaylistSort={handleSongReorder}
              onSongClick={setActiveIndex}
              onRemoveSong={(songId) => removeSongMutation.mutate(songId)}
            />
          )}
        </div>

        {/* Danger Zone */}
        <div className="rounded-lg border border-destructive/50 bg-card p-4">
          <h3 className="text-sm font-semibold text-destructive mb-3">
            {t.playlistDetail.dangerZone}
          </h3>
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">{t.playlistDetail.deletePlaylist}</p>
              <p className="text-xs text-muted-foreground">
                {t.playlistDetail.deletePlaylistDescription}
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  className="shrink-0"
                  id={deleteDialogIds.triggerId}
                  aria-controls={deleteDialogIds.contentId}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent id={deleteDialogIds.contentId}>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t.playlistDetail.deletePlaylistConfirmTitle}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t.playlistDetail.deletePlaylistConfirmDescription.replace(
                      "{name}",
                      playlist.name
                    )}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
                  <AlertDialogAction variant="destructive" onClick={() => onDelete(playlist.id)}>
                    {t.playlistDetail.deletePlaylist}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      {/* Lyrics Drawer */}
      <Drawer
        open={activeIndex !== null}
        onOpenChange={(open) => !open && setActiveIndex(null)}
        direction="top"
      >
        <DrawerContent className="inset-0 h-full p-0 data-[vaul-drawer-direction=top]:max-h-full data-[vaul-drawer-direction=top]:rounded-none">
          <div className="relative flex h-full flex-col">
            <DrawerHeader className="sr-only">
              <DrawerTitle>
                {activeSong ? `${activeSong.title} lyrics` : "Song lyrics"}
              </DrawerTitle>
            </DrawerHeader>

            <div className="pointer-events-none absolute right-4 bottom-6 z-20">
              <div className="pointer-events-auto flex items-center gap-1 rounded-full border bg-background/90 px-1.5 py-1 shadow-md backdrop-blur-sm">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() =>
                    setActiveIndex((i) => (i !== null && i > 0 ? i - 1 : i))
                  }
                  disabled={activeIndex === null || activeIndex === 0}
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <span className="min-w-10 text-center text-xs tabular-nums text-muted-foreground">
                  {activeIndex !== null ? `${activeIndex + 1}/${totalSongs}` : ""}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() =>
                    setActiveIndex((i) => (i !== null && i < totalSongs - 1 ? i + 1 : i))
                  }
                  disabled={activeIndex === null || activeIndex >= totalSongs - 1}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {activeSong && (
                <LyricsView
                  mode="panel"
                  readOnly
                  onClose={() => setActiveIndex(null)}
                  song={{
                    ...activeSong,
                    lyrics: activeSong.lyrics ?? "",
                    fontSize: activeSong.fontSize ?? 1,
                    transpose: activeSong.transpose ?? 0,
                    capo: activeSong.capo ?? 0
                  }}
                />
              )}
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Add Songs Sheet */}
      <AddSongsSheet
        open={isAddSongsOpen}
        onClose={() => setIsAddSongsOpen(false)}
        playlistId={playlist.id}
        existingSongIds={songsWithPosition.map((s) => s.id)}
      />
    </div>
  )
}
