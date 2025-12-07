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
  Lock,
  Globe,
  Users,
  Copy,
  ExternalLink
} from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/hooks/use-translation"
import type { Playlist, Song } from "@/types"
import type { SongWithPosition, PlaylistWithSongs } from "@/types/extended"
import { DraggablePlaylist } from "@/components/draggable-playlist"
import { usePlaylists } from "@/contexts/playlists-context"
import { getSongsByIds } from "@/lib/songs-data"

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
  multiline = false
}: {
  value: string
  onSave: (value: string) => void
  className?: string
  inputClassName?: string
  multiline?: boolean
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
    if (editValue.trim() && editValue !== value) {
      onSave(editValue.trim())
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
        <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={handleSave}>
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
      <span className={multiline ? "whitespace-pre-wrap" : "truncate"}>
        {value || "Click to add"}
      </span>
      <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity shrink-0" />
    </button>
  )
}

export function PlaylistDetail({ playlist, onClose, onUpdate, onDelete }: PlaylistDetailProps) {
  const { reorderPlaylistSongs } = usePlaylists()
  const { t } = useTranslation()
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  // Convert playlist songs to SongWithPosition format
  // TODO: Replace with backend API call to fetch songs by IDs
  const songsWithPosition = useMemo<SongWithPosition[]>(() => {
    const songs = getSongsByIds(playlist.songs)
    return songs.map((song, index) => ({
      ...song,
      position: index
    }))
  }, [playlist.songs])

  // Create PlaylistWithSongs object
  const playlistWithSongs = useMemo<PlaylistWithSongs>(
    () => ({
      ...playlist,
      songs: songsWithPosition
    }),
    [playlist, songsWithPosition]
  )

  const handleSongReorder = async (sourceIndex: number, destinationIndex: number) => {
    reorderPlaylistSongs(playlist.id, sourceIndex, destinationIndex)
  }

  return (
    <div className="flex flex-1 flex-col bg-muted/30">
      <div className="shrink-0 flex items-center justify-between border-b bg-background p-4 lg:p-6">
        <div className="flex-1 min-w-0">
          <EditableField
            value={playlist.name}
            onSave={(value) => onUpdate(playlist.id, { name: value })}
            className="text-lg font-semibold"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
        {/* Delete Button */}
        <div>
          <Button
            variant="destructive"
            size="sm"
            className="gap-2 w-full sm:w-auto"
            onClick={() => onDelete(playlist.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>{t.playlistDetail.deletePlaylist}</span>
          </Button>
        </div>
        {/* Details Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium">{t.playlistDetail.details}</h3>
          <div className="flex flex-wrap gap-2">
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "flex items-center gap-2 rounded-full bg-background border px-3 py-1.5 h-auto font-normal",
                    !playlist.date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="h-3.5 w-3.5" />
                  {playlist.date
                    ? format(new Date(playlist.date), "PPP")
                    : t.playlistDetail.pickDate}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={playlist.date ? new Date(playlist.date) : undefined}
                  onSelect={(date) => {
                    if (date) {
                      onUpdate(playlist.id, { date: format(date, "yyyy-MM-dd") })
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
                defaultChecked={playlist.visibility === "public"}
                onCheckedChange={(checked) => {
                  console.log("Visibility changed:", checked)
                  onUpdate(playlist.id, { visibility: checked ? "public" : "private" })
                }}
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
                        `${window.location.origin}/dashboard/playlist/${playlist.shareCode}`
                      )
                      toast.success(t.playlistDetail.copied)
                    }}
                  >
                    <Copy className="h-3 w-3" />
                    {t.playlistDetail.copy}
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <a
                      href={`/dashboard/playlist/${playlist.shareCode}`}
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
                <p className="text-xs text-muted-foreground">{t.playlistDetail.guestsCanReorder}</p>
              </div>
              <Switch
                defaultChecked={playlist.allowGuestEditing || false}
                onCheckedChange={(checked) => {
                  console.log("Guest editing changed:", checked)
                  onUpdate(playlist.id, { allowGuestEditing: checked })
                }}
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-3">{t.playlistDetail.songs}</h3>
          {playlist.songs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 border border-dashed rounded-lg">
              <ListMusic className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">{t.playlistDetail.noSongsInPlaylist}</p>
              <Button variant="outline" size="sm" className="mt-3 gap-2">
                <Plus className="h-4 w-4" />
                {t.playlistDetail.addSongsButton}
              </Button>
            </div>
          ) : (
            <DraggablePlaylist
              playlist={playlistWithSongs}
              songs={songsWithPosition}
              onPlaylistSort={handleSongReorder}
            />
          )}
        </div>
      </div>
    </div>
  )
}
