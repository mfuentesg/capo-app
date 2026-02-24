"use client"

import {
  Globe,
  Share2,
  Clock3,
  ListMusic,
  CalendarDays,
  ChevronUp,
  ChevronDown,
  Music2,
  GripVertical,
  Settings,
  Copy,
  ExternalLink
} from "lucide-react"
import { toast } from "sonner"
import { useEffect, useRef, useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd"
import { useLocale } from "@/features/settings"
import { useUser } from "@/features/auth"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { LyricsView } from "@/features/lyrics-editor"
import type { PlaylistWithSongs } from "@/features/playlists/types"
import type { Playlist } from "@/features/playlists/types"
import type { Song } from "@/features/songs"
import { reorderPlaylistSongsAction, updatePlaylistAction } from "@/features/playlists/api/actions"
import { getPublicPlaylistByShareCode } from "@/features/playlists/api/playlistsApi"
import { createClient } from "@/lib/supabase/client"
import { formatLongDate } from "@/lib/utils"

interface PlaylistShareViewProps {
  playlist: PlaylistWithSongs
}

export function PlaylistShareView({ playlist }: PlaylistShareViewProps) {
  const { t, locale } = useLocale()
  const { data: user } = useUser()
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [songs, setSongs] = useState<Song[]>(playlist.songs)
  const [localVisibility, setLocalVisibility] = useState(playlist.visibility)
  const [localGuestEditing, setLocalGuestEditing] = useState(playlist.allowGuestEditing ?? false)
  const bodyOverflowRef = useRef<string>("")

  const songsCountLabel = songs.length === 1 ? t.playlistDetail.song : t.playlistDetail.songsPlural

  const reorderMutation = useMutation({
    mutationFn: (updates: Array<{ songId: string; position: number }>) =>
      reorderPlaylistSongsAction(playlist.id, updates, playlist.shareCode)
  })

  const updateMutation = useMutation({
    mutationFn: (updates: Partial<Playlist>) => updatePlaylistAction(playlist.id, updates),
    onError: () => {
      toast.error(t.toasts?.error || "Something went wrong")
    }
  })

  const handleDragEnd = (result: DropResult) => {
    const { destination, source } = result
    if (!destination || destination.index === source.index) return

    const reordered = Array.from(songs)
    const [moved] = reordered.splice(source.index, 1)
    reordered.splice(destination.index, 0, moved)

    setSongs(reordered)
    reorderMutation.mutate(reordered.map((song, position) => ({ songId: song.id, position })))
  }

  useEffect(() => {
    if (activeIndex === null) return

    bodyOverflowRef.current = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      document.body.style.overflow = bodyOverflowRef.current
    }
  }, [activeIndex])

  // Realtime: subscribe to playlist settings and song order changes
  useEffect(() => {
    if (!playlist.id) return

    const supabase = createClient()
    const channel = supabase
      .channel(`share-view:${playlist.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "playlists",
          filter: `id=eq.${playlist.id}`
        },
        (payload) => {
          const updated = payload.new as { is_public: boolean; allow_guest_editing: boolean }
          setLocalVisibility(updated.is_public ? "public" : "private")
          setLocalGuestEditing(updated.allow_guest_editing ?? false)
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "playlist_songs",
          filter: `playlist_id=eq.${playlist.id}`
        },
        async () => {
          if (!playlist.shareCode) return
          const updated = await getPublicPlaylistByShareCode(supabase, playlist.shareCode)
          if (updated) setSongs(updated.songs)
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [playlist.id, playlist.shareCode])

  const activeSong = activeIndex !== null ? songs[activeIndex] : null
  const totalSongs = songs.length

  const handleCloseDrawer = () => setActiveIndex(null)
  const handlePrevSong = () => {
    if (activeIndex === null || activeIndex === 0) return
    setActiveIndex(activeIndex - 1)
  }
  const handleNextSong = () => {
    if (activeIndex === null || activeIndex >= totalSongs - 1) return
    setActiveIndex(activeIndex + 1)
  }

  const copyShareUrl = async () => {
    if (!playlist.shareCode) return
    const shareUrl = `${window.location.origin}/shared/${playlist.shareCode}`
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success(t.playlistDetail.copied)
    } catch {
      toast.error(t.common.copyToClipboardFailed)
    }
  }

  const handleVisibilityChange = (checked: boolean) => {
    const newVisibility = checked ? "public" : "private"
    setLocalVisibility(newVisibility)
    if (!checked && localGuestEditing) {
      setLocalGuestEditing(false)
      updateMutation.mutate({ visibility: newVisibility, allowGuestEditing: false })
    } else {
      updateMutation.mutate({ visibility: newVisibility })
    }
  }

  const handleGuestEditingChange = (checked: boolean) => {
    setLocalGuestEditing(checked)
    updateMutation.mutate({ allowGuestEditing: checked })
  }

  const canReorder = !!user || localGuestEditing

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <main className="mx-auto max-w-2xl px-4 pb-20 pt-6">
        {/* Playlist header */}
        <div className="mb-6 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 space-y-1.5">
              <div className="flex flex-wrap items-center gap-1.5">
                {localVisibility === "public" && (
                  <Badge variant="secondary" className="h-5 gap-1 px-1.5 text-xs font-normal">
                    <Globe className="h-3 w-3" />
                    {t.filters.public}
                  </Badge>
                )}
                {localGuestEditing && (
                  <Badge variant="secondary" className="h-5 px-1.5 text-xs font-normal">
                    {t.playlistShare.guestEditing}
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl font-semibold tracking-tight">{playlist.name}</h1>
              {playlist.description && (
                <p className="text-sm text-muted-foreground">{playlist.description}</p>
              )}
              <div className="flex flex-wrap items-center gap-3 pt-0.5 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <ListMusic className="h-3.5 w-3.5" />
                  {songs.length} {songsCountLabel}
                </span>
                {playlist.date && (
                  <span className="flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {formatLongDate(playlist.date, locale)}
                  </span>
                )}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              {playlist.shareCode && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={copyShareUrl}
                  aria-label={t.playlistShare.share}
                >
                  <Share2 className="h-3.5 w-3.5" />
                  {t.playlistShare.share}
                </Button>
              )}

              {!!user && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72" align="end">
                    <h3 className="text-sm font-medium mb-4">{t.playlistDetail.privacySharing}</h3>
                    <div className="space-y-4">
                      {/* Public visibility */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="space-y-0.5">
                          <p className="text-sm font-medium">{t.playlistDetail.publicVisibility}</p>
                          <p className="text-xs text-muted-foreground">
                            <Globe className="h-3 w-3 inline mr-1" />
                            {t.playlistDetail.anyoneWithLink}
                          </p>
                        </div>
                        <Switch
                          checked={localVisibility === "public"}
                          onCheckedChange={handleVisibilityChange}
                        />
                      </div>

                      {/* Share URL */}
                      {localVisibility === "public" && playlist.shareCode && (
                        <div className="space-y-1.5">
                          <p className="text-xs font-medium text-muted-foreground">
                            {t.playlistDetail.publicUrl}
                          </p>
                          <div className="flex items-center gap-1.5">
                            <code className="flex-1 truncate rounded bg-muted px-2 py-1 text-xs font-mono">
                              {playlist.shareCode}
                            </code>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 shrink-0"
                              onClick={copyShareUrl}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" asChild>
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

                      {/* Guest editing */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="space-y-0.5">
                          <p className="text-sm font-medium">{t.playlistDetail.guestEditing}</p>
                          <p className="text-xs text-muted-foreground">
                            {localVisibility !== "public"
                              ? t.playlistDetail.guestEditingDisabledHint
                              : t.playlistDetail.guestsCanReorder}
                          </p>
                        </div>
                        <Switch
                          checked={localGuestEditing}
                          disabled={localVisibility !== "public" || updateMutation.isPending}
                          onCheckedChange={handleGuestEditingChange}
                        />
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </div>
          </div>
        </div>

        {/* Songs list */}
        {songs.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Music2 className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">{t.playlistDetail.noSongsInPlaylist}</p>
          </div>
        ) : canReorder ? (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId={playlist.id}>
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={`divide-y overflow-hidden rounded-xl border bg-card ${snapshot.isDraggingOver ? "bg-accent/20" : ""}`}
                >
                  {songs.map((song, index) => (
                    <Draggable key={song.id} draggableId={song.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors cursor-grab active:cursor-grabbing ${snapshot.isDragging ? "bg-card opacity-90 shadow-md" : "hover:bg-muted/50"}`}
                          onClick={() => setActiveIndex(index)}
                        >
                          <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <span className="w-5 shrink-0 text-center text-xs tabular-nums text-muted-foreground">
                            {index + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{song.title}</p>
                            {song.artist && (
                              <p className="truncate text-xs text-muted-foreground">{song.artist}</p>
                            )}
                          </div>
                          <div className="flex shrink-0 items-center gap-1.5">
                            {song.key && (
                              <Badge variant="outline" className="h-5 px-1.5 text-xs font-normal">
                                {song.key}
                              </Badge>
                            )}
                            {song.bpm > 0 && (
                              <Badge
                                variant="outline"
                                className="hidden h-5 items-center gap-0.5 px-1.5 text-xs font-normal sm:flex"
                              >
                                <Clock3 className="h-2.5 w-2.5" />
                                {song.bpm}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        ) : (
          <div className="divide-y rounded-xl border bg-card">
            {songs.map((song, index) => (
              <button
                key={song.id}
                type="button"
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 first:rounded-t-xl last:rounded-b-xl active:bg-muted"
                onClick={() => setActiveIndex(index)}
                aria-label={`${song.title} ${song.artist}`}
              >
                <span className="w-5 shrink-0 text-center text-xs tabular-nums text-muted-foreground">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{song.title}</p>
                  {song.artist && (
                    <p className="truncate text-xs text-muted-foreground">{song.artist}</p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  {song.key && (
                    <Badge variant="outline" className="h-5 px-1.5 text-xs font-normal">
                      {song.key}
                    </Badge>
                  )}
                  {song.bpm > 0 && (
                    <Badge
                      variant="outline"
                      className="hidden h-5 items-center gap-0.5 px-1.5 text-xs font-normal sm:flex"
                    >
                      <Clock3 className="h-2.5 w-2.5" />
                      {song.bpm}
                    </Badge>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

      {/* Lyrics drawer */}
      <Drawer
        open={activeIndex !== null}
        onOpenChange={(open) => !open && handleCloseDrawer()}
        direction="top"
      >
        <DrawerContent className="inset-0 h-full p-0 data-[vaul-drawer-direction=top]:max-h-full data-[vaul-drawer-direction=top]:rounded-none">
          <div className="relative flex h-full flex-col">
            <DrawerHeader className="sr-only">
              <DrawerTitle>
                {activeSong ? `${activeSong.title} lyrics` : "Song lyrics"}
              </DrawerTitle>
            </DrawerHeader>

            {/* Navigation controls */}
            <div className="pointer-events-none absolute right-4 bottom-safe-4 bottom-6 z-20">
              <div className="pointer-events-auto flex items-center gap-1 rounded-full border bg-background/90 px-1.5 py-1 shadow-md backdrop-blur-sm">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={handlePrevSong}
                  disabled={activeIndex === null || activeIndex === 0}
                  aria-label={t.playlistShare.previousSong}
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
                  onClick={handleNextSong}
                  disabled={activeIndex === null || activeIndex >= totalSongs - 1}
                  aria-label={t.playlistShare.nextSong}
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
                  onClose={handleCloseDrawer}
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
    </div>
  )
}
