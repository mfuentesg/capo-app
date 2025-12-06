"use client"

import { useState, useRef, useEffect } from "react"
import { X, Calendar, Pencil, Check, Trash2, Plus, Music } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Playlist } from "@/types"

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
      <span className={multiline ? "whitespace-pre-wrap" : "truncate"}>
        {value || "Click to add"}
      </span>
      <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity shrink-0" />
    </button>
  )
}

export function PlaylistDetail({ playlist, onClose, onUpdate, onDelete }: PlaylistDetailProps) {
  return (
    <div className="flex flex-1 flex-col bg-muted/30">
      <div className="shrink-0 flex items-center justify-between border-b bg-background p-4 lg:p-6">
        <div className="flex-1 min-w-0">
          <EditableField
            value={playlist.name}
            onSave={(value) => onUpdate(playlist.id, { name: value })}
            className="text-lg font-semibold"
          />
          {playlist.description && (
            <EditableField
              value={playlist.description}
              onSave={(value) => onUpdate(playlist.id, { description: value })}
              className="text-sm text-muted-foreground mt-1"
            />
          )}
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
        <div>
          <h3 className="text-sm font-medium mb-3">Details</h3>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 rounded-full bg-background border px-3 py-1.5">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <Input
                type="date"
                value={playlist.date || ""}
                onChange={(e) => onUpdate(playlist.id, { date: e.target.value })}
                className="h-auto border-0 p-0 text-sm w-auto"
              />
            </div>
            <div className="flex items-center gap-2 rounded-full bg-background border px-3 py-1.5">
              <span className="text-xs text-muted-foreground">Songs:</span>
              <span className="text-sm font-medium">{playlist.songs.length}</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-3">Songs</h3>
          {playlist.songs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 border border-dashed rounded-lg">
              <Music className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No songs in this playlist</p>
              <Button variant="outline" size="sm" className="mt-3 gap-2">
                <Plus className="h-4 w-4" />
                Add Songs
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {playlist.songs.map((song, index) => (
                <div
                  key={song.id}
                  className="flex items-center gap-3 rounded-lg border bg-background p-3"
                >
                  <span className="text-sm text-muted-foreground w-5">{index + 1}</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-muted text-xs font-semibold">
                    {song.key}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{song.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs shrink-0">
                    {song.bpm} BPM
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 pt-4 border-t">
          <Button
            variant="destructive"
            size="sm"
            className="gap-2"
            onClick={() => onDelete(playlist.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete Playlist
          </Button>
        </div>
      </div>
    </div>
  )
}
