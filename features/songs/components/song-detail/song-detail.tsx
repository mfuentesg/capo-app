"use client"
import { useState, useRef, useEffect } from "react"
import {
  X,
  Clock,
  Trash2,
  ListPlus,
  Check,
  Pencil,
  Music2,
  Guitar,
  Minus,
  Plus
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
import { cn } from "@/lib/utils"
import type { Song } from "@/features/songs/types"
import { KeySelect } from "@/features/songs"
import { usePlaylistDraft } from "@/features/playlist-draft"
import { transposeKey, calculateCapoKey } from "@/lib/music-theory"
import { useTranslation } from "@/hooks/use-translation"

interface EditableFieldProps {
  value: string
  onSave: (value: string) => void
  className?: string
  inputClassName?: string
}

function EditableField({ value, onSave, className, inputClassName }: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleSave = () => {
    if (editValue.trim() && editValue !== value) {
      onSave(editValue.trim())
    } else {
      setEditValue(value)
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave()
    } else if (e.key === "Escape") {
      setEditValue(value)
      setIsEditing(false)
    }
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-1.5">
        <Input
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          className={cn("h-8 px-2", inputClassName)}
        />
        <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={handleSave}>
          <Check className="h-4 w-4 text-green-600" />
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
      <span className="truncate">{value}</span>
      <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity shrink-0" />
    </button>
  )
}

interface SongDetailProps {
  song: Song
  onClose: () => void
  onUpdate: (songId: string, updates: Partial<Song>) => void
  onDelete: (songId: string) => void
}

export function SongDetail({ song, onClose, onUpdate, onDelete }: SongDetailProps) {
  const { t } = useTranslation()
  const { isSongInDraft, toggleSongInDraft } = usePlaylistDraft()
  const isInCart = isSongInDraft(song.id)
  const [transpose, setTranspose] = useState(0)
  const [capoPosition, setCapoPosition] = useState(0)

  return (
    <div className="flex flex-1 flex-col bg-muted/30">
      <div className="shrink-0 flex items-center justify-between border-b bg-background p-4 lg:p-6">
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <EditableField
                value={song.title}
                onSave={(value) => onUpdate(song.id, { title: value })}
                className="text-lg font-semibold"
                inputClassName="text-lg font-semibold"
              />
              {song.isDraft && (
                <Badge variant="secondary" className="text-xs">
                  {t.songs.draft}
                </Badge>
              )}
            </div>
            <EditableField
              value={song.artist}
              onSave={(value) => onUpdate(song.id, { artist: value })}
              className="text-sm text-muted-foreground"
              inputClassName="text-sm"
            />
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        <div className="max-w-2xl space-y-6">
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 rounded-full bg-background border px-3 py-1.5">
              <span className="text-xs text-muted-foreground">{t.songs.key}</span>
              <KeySelect
                value={song.key}
                onValueChange={(value) => onUpdate(song.id, { key: value })}
                className="h-auto border-0 p-0 font-medium text-sm w-auto gap-1"
              />
            </div>
            <div className="flex items-center gap-2 rounded-full bg-background border px-3 py-1.5">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <Input
                type="number"
                min={20}
                max={500}
                value={song.bpm}
                onChange={(e) => {
                  const value = Number.parseInt(e.target.value)
                  if (!isNaN(value) && value >= 20 && value <= 500) {
                    onUpdate(song.id, { bpm: value })
                  }
                }}
                className="h-auto border-0 p-0 font-medium text-sm tabular-nums w-14 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="text-xs text-muted-foreground">{t.songs.bpm}</span>
            </div>
          </div>

          {/* Transpose Control */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Music2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{t.songs.transpose}</span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTranspose((prev) => Math.max(prev - 1, -6))}
                disabled={transpose <= -6}
                className="h-8"
              >
                <Minus className="h-3.5 w-3.5" />
              </Button>
              <div className="flex items-center gap-2 rounded-lg bg-background border px-4 py-2 min-w-20 justify-center">
                <span className="text-sm font-medium tabular-nums">
                  {transpose > 0 ? `+${transpose}` : transpose}
                </span>
                <span className="text-xs text-muted-foreground">{t.songs.semitones}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTranspose((prev) => Math.min(prev + 1, 6))}
                disabled={transpose >= 6}
                className="h-8"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
              {transpose !== 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTranspose(0)}
                  className="text-xs h-8"
                >
                  {t.songs.reset}
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {t.songs.originalKey}: <span className="font-medium">{song.key}</span>
              {transpose !== 0 && (
                <>
                  {" → "}
                  {t.songs.transposed}:{" "}
                  <span className="font-medium">{transposeKey(song.key, transpose)}</span>
                </>
              )}
            </p>
          </div>

          {/* Capo Control */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Guitar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{t.songs.capo}</span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCapoPosition((prev) => Math.max(prev - 1, 0))}
                disabled={capoPosition <= 0}
                className="h-8"
              >
                <Minus className="h-3.5 w-3.5" />
              </Button>
              <div className="flex items-center gap-2 rounded-lg bg-background border px-4 py-2 min-w-30 justify-center">
                <span className="text-sm font-medium tabular-nums">
                  {capoPosition === 0 ? t.songs.noCapo : `${t.songs.fret} ${capoPosition}`}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCapoPosition((prev) => Math.min(prev + 1, 12))}
                disabled={capoPosition >= 12}
                className="h-8"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
              {capoPosition !== 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCapoPosition(0)}
                  className="text-xs h-8"
                >
                  {t.songs.reset}
                </Button>
              )}
            </div>
            {capoPosition > 0 && (
              <p className="text-xs text-muted-foreground">
                {t.songs.playIn}:{" "}
                <span className="font-medium">{calculateCapoKey(song.key, capoPosition)}</span>
                {" ("}
                {t.songs.capo} {capoPosition}
                {" = "}
                <span className="font-medium">{song.key}</span> {t.songs.key.toLowerCase()}
                {")"}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2 pt-4 border-t">
            <Button
              variant={isInCart ? "default" : "outline"}
              size="sm"
              className="gap-2"
              onClick={() => toggleSongInDraft(song)}
            >
              {isInCart ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  {t.songs.addedToSelection}
                </>
              ) : (
                <>
                  <ListPlus className="h-3.5 w-3.5" />
                  {t.songs.addToPlaylist}
                </>
              )}
            </Button>
            {!song.lyrics && (
              <Link href={`/dashboard/songs/${song.id}`}>
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                  <Music2 className="h-3.5 w-3.5" />
                  {t.songs.addLyrics}
                </Button>
              </Link>
            )}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 text-destructive hover:text-destructive bg-transparent"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {t.common.delete}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t.songs.deleteSongConfirmTitle}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t.songs.deleteSongConfirmDescription.replace("{title}", song.title)}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
                  <AlertDialogAction variant="destructive" onClick={() => onDelete(song.id)}>
                    {t.songs.deleteSong}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  )
}
