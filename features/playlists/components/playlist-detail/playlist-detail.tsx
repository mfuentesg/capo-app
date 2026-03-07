"use client"

import { useState, useRef, useEffect, useMemo, forwardRef } from "react"
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
  ChevronDown,
  Clock,
  MoreVertical,
  Eye,
  Settings
} from "lucide-react"
import { toast } from "sonner"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
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
import { Badge } from "@/components/ui/badge"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { cn, formatLongDate, formatDateISO, parseDateValue } from "@/lib/utils"
import { useTranslation } from "@/hooks/use-translation"
import { useLocale } from "@/features/settings"
import { LyricsView, type LyricsViewHandle } from "@/features/lyrics-editor"
import {
  useUpdateSong,
  useUserSongSettings,
  useEffectiveSongSettings,
  useUpsertUserSongSettings,
  useUserPreferences,
  SongSkeleton
} from "@/features/songs"
import type { Playlist } from "@/features/playlists/types"
import type { SongWithPosition, PlaylistWithSongs } from "@/types/extended"
import { DraggablePlaylist } from "@/features/playlists/utils"
import { useReorderPlaylistSongs, usePlaylistSongs, usePlaylistRealtime } from "../../hooks"
import { playlistsKeys } from "../../hooks/query-keys"
import { removeSongFromPlaylistAction } from "../../api/actions"
import { createOverlayIds } from "@/lib/ui/stable-overlay-ids"
import { AddSongsSheet } from "./add-songs-sheet"

interface ActiveSongLyricsProps {
  song: SongWithPosition
  onClose: () => void
  onSaveLyrics: (lyrics: string) => void
  isSaving: boolean
}

const ActiveSongLyrics = forwardRef<LyricsViewHandle, ActiveSongLyricsProps>(
  function ActiveSongLyrics({ song, onClose, onSaveLyrics, isSaving }, ref) {
    const { data: userSettings } = useUserSongSettings(song)
    const effectiveSettings = useEffectiveSongSettings(song)
    const { mutate: upsertSettings } = useUpsertUserSongSettings(song)
    const { data: preferences } = useUserPreferences()
    const settingsKey = userSettings === undefined ? "loading" : "ready"

    return (
      <LyricsView
        ref={ref}
        key={settingsKey}
        mode="panel"
        song={{
          ...song,
          lyrics: song.lyrics ?? "",
          fontSize: song.fontSize ?? 1,
          transpose: song.transpose ?? 0,
          capo: song.capo ?? 0
        }}
        onClose={onClose}
        onSaveLyrics={onSaveLyrics}
        isSaving={isSaving}
        initialSettings={effectiveSettings}
        onSettingsChange={upsertSettings}
        initialLyricsColumns={preferences?.lyricsColumns ?? 2}
      />
    )
  }
)

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
  const { data: playlistWithSongsData, isLoading } = usePlaylistSongs(playlist.id)
  const { t } = useTranslation()
  const { locale } = useLocale()
  const queryClient = useQueryClient()
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [isAddSongsOpen, setIsAddSongsOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
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

  const lyricsViewRef = useRef<LyricsViewHandle>(null)
  const { mutate: updateSong, isPending: isSavingLyrics } = useUpdateSong()

  const removeSongMutation = useMutation({
    mutationFn: (songId: string) => removeSongFromPlaylistAction(playlist.id, songId),
    onMutate: async (songId) => {
      const queryKey = playlistsKeys.detail(playlist.id)
      await queryClient.cancelQueries({ queryKey })
      const previousData = queryClient.getQueryData<PlaylistWithSongs>(queryKey)

      if (previousData) {
        queryClient.setQueryData<PlaylistWithSongs>(queryKey, {
          ...previousData,
          songs: previousData.songs.filter((s) => s.id !== songId)
        })
      }

      return { previousData }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playlistsKeys.lists() })
      toast.success(t.toasts.songDeleted)
    },
    onError: (_err, _songId, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(playlistsKeys.detail(playlist.id), context.previousData)
      }
      toast.error(t.toasts?.error || "Something went wrong")
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: playlistsKeys.detail(playlist.id) })
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
          <div className="flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <a
                    href={`/shared/${playlist.shareCode}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    {t.playlistDetail.previewAsGuest}
                  </a>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-destructive focus:text-destructive focus:bg-destructive/10"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t.playlistDetail.deletePlaylist}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label={t.common.close} className="h-8 w-8">
              <X className="h-5 w-5" />
            </Button>
          </div>
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

      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8 max-w-[1200px] mx-auto">
          {/* Sidebar / Left Column (Settings) */}
          <div className="space-y-6 lg:col-span-4 xl:col-span-3 order-2 lg:order-1">
            {/* Playlist Settings Card */}
            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
              <div className="p-4 border-b bg-muted/20">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  {t.playlistDetail.details}
                </h3>
              </div>
              <div className="p-4 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {t.playlistDetail.pickDate}
                  </label>
                  <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        id={calendarPopoverIds.triggerId}
                        aria-controls={calendarPopoverIds.contentId}
                        className={cn(
                          "w-full flex items-center justify-start gap-2 rounded-lg bg-background border px-3 py-2 h-auto font-normal",
                          !playlist.date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="h-4 w-4" />
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
                </div>

                <div className="pt-4 border-t space-y-4">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {t.playlistDetail.privacySharing}
                  </label>
                  
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-0.5 flex-1">
                      <label className="text-sm font-medium">{t.playlistDetail.publicVisibility}</label>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Globe className="h-3 w-3 shrink-0" />
                        {t.playlistDetail.anyoneWithLink}
                      </p>
                    </div>
                    <Switch
                      checked={playlist.visibility === "public"}
                      onCheckedChange={handleVisibilityChange}
                    />
                  </div>

                  {playlist.visibility === "public" && playlist.shareCode && (
                    <div className="space-y-2 rounded-lg bg-muted/30 p-2.5">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <p className="text-[10px] font-medium uppercase text-muted-foreground">{t.playlistDetail.publicUrl}</p>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              `${window.location.origin}/shared/${playlist.shareCode}`
                            )
                            toast.success(t.playlistDetail.copied)
                          }}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <code className="block w-full bg-background px-2 py-1 rounded border text-[10px] font-mono break-all mb-2 overflow-hidden">
                        {playlist.shareCode}
                      </code>
                      <Button size="sm" variant="secondary" className="w-full h-7 text-xs gap-1.5" asChild>
                        <a
                          href={`/shared/${playlist.shareCode}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-3 w-3" />
                          {t.playlistDetail.openPublicView}
                        </a>
                      </Button>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <label className="text-sm font-medium">{t.playlistDetail.guestEditing}</label>
                      <p className="text-[10px] text-muted-foreground leading-tight">
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
            </div>

            {/* Context/Activity Panel */}
            <div className="rounded-xl border bg-card shadow-sm p-4 hidden lg:block">
              <h3 className="text-sm font-semibold mb-3">{t.dashboard.recentActivity}</h3>
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <Clock className="h-8 w-8 text-muted-foreground mb-2 opacity-20" />
                <p className="text-xs text-muted-foreground">{t.activity?.noActivity ?? "No activity to show."}</p>
              </div>
            </div>
          </div>

          {/* Main Content Column: Songs */}
          <div className="space-y-6 lg:col-span-8 xl:col-span-9 order-1 lg:order-2">
            <div className="rounded-xl border bg-card shadow-sm flex flex-col min-h-[400px]">
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2">
                  <ListMusic className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">{t.playlistDetail.songs}</h3>
                  <Badge variant="secondary" className="rounded-full ml-1">
                    {playlist.songs.length}
                  </Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 rounded-full px-4"
                  onClick={() => setIsAddSongsOpen(true)}
                >
                  <Plus className="h-3.5 w-3.5" />
                  {t.playlistDetail.addSongsButton}
                </Button>
              </div>
              
              <div className="flex-1">
                {isLoading ? (
                  <div className="p-4 space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <SongSkeleton key={i} />
                    ))}
                  </div>
                ) : playlist.songs.length === 0 ? (
                  <Empty className="py-20">
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
                        className="gap-2 rounded-full"
                        onClick={() => setIsAddSongsOpen(true)}
                      >
                        <Plus className="h-4 w-4" />
                        {t.playlistDetail.addSongsButton}
                      </Button>
                    </EmptyContent>
                  </Empty>
                ) : (
                  <div className="p-2">
                    <DraggablePlaylist
                      playlist={playlistWithSongs}
                      songs={songsWithPosition}
                      onPlaylistSort={handleSongReorder}
                      onSongClick={setActiveIndex}
                      onRemoveSong={(songId) => removeSongMutation.mutate(songId)}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lyrics Drawer */}
      <Drawer
        open={activeIndex !== null}
        onOpenChange={(open) => {
          if (!open) lyricsViewRef.current?.requestClose()
        }}
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
                <div className="flex flex-col items-center px-2 min-w-[100px]">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">
                    Song {activeIndex !== null ? activeIndex + 1 : 0} of {totalSongs}
                  </span>
                  <span className="text-[10px] text-muted-foreground/60 tabular-nums">
                    {t.playlistDetail.inPlaylist}
                  </span>
                </div>
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
                <ActiveSongLyrics
                  key={activeSong.id}
                  ref={lyricsViewRef}
                  song={activeSong}
                  onClose={() => setActiveIndex(null)}
                  onSaveLyrics={(lyrics) => {
                    const songId = activeSong.id
                    queryClient.setQueryData(
                      playlistsKeys.detail(playlist.id),
                      (old: PlaylistWithSongs | null | undefined) => {
                        if (!old) return old
                        return {
                          ...old,
                          songs: old.songs.map((s) => (s.id === songId ? { ...s, lyrics } : s))
                        }
                      }
                    )
                    updateSong(
                      { songId, updates: { lyrics } },
                      {
                        onSuccess: () =>
                          queryClient.invalidateQueries({
                            queryKey: playlistsKeys.detail(playlist.id)
                          })
                      }
                    )
                  }}
                  isSaving={isSavingLyrics}
                />
              )}
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
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
