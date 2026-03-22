"use client"

import { memo, startTransition } from "react"
import { GripVerticalIcon, X } from "lucide-react"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

import { PlaylistSongItem } from "@/features/playlists"
import { type SongWithPosition, type PlaylistWithSongs } from "@/types/extended"
import { blockNextDocumentClick } from "@/lib/dnd"

const SortableSong = memo(
  ({
    song,
    index,
    onSongClick,
    onRemoveSong
  }: {
    song: SongWithPosition
    index: number
    onSongClick?: (index: number) => void
    onRemoveSong?: (songId: string) => void
  }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
      id: song.id
    })

    const sortStyle = {
      transform: CSS.Transform.toString(transform),
      transition
    }

    return (
      <div
        ref={setNodeRef}
        style={sortStyle}
        {...attributes}
        className={`relative rounded-lg ${isDragging ? "opacity-70 z-50" : ""}`}
      >
        {/* Song row — draggable anywhere via long-press, tappable to open lyrics */}
        <div
          className={`relative touch-manipulation cursor-pointer ${isDragging ? "cursor-grabbing" : ""}`}
          {...listeners}
          onClick={() => startTransition(() => onSongClick?.(index))}
        >
          <PlaylistSongItem song={song} index={index} showDragHandle />

          {/* Right action column: drag affordance + remove button */}
          <div className="absolute right-3 inset-y-0 flex flex-col items-center justify-center gap-1.5">
            <GripVerticalIcon className="h-4 w-4 text-muted-foreground/40 transition-colors group-hover:text-muted-foreground/70 pointer-events-none" />
            {onRemoveSong && (
              <button
                type="button"
                aria-label="Remove from playlist"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation()
                  onRemoveSong(song.id)
                }}
                className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground/50 hover:text-destructive transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }
)

SortableSong.displayName = "SortableSong"

export function DraggablePlaylist({
  playlist,
  songs,
  onPlaylistSort,
  onSongClick,
  onRemoveSong
}: {
  playlist: PlaylistWithSongs
  songs: SongWithPosition[]
  onPlaylistSort: (s: number, d: number) => Promise<void>
  onSongClick?: (index: number) => void
  onRemoveSong?: (songId: string) => void
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Long-press to activate drag so a quick tap still opens lyrics without
      // accidentally triggering a reorder.
      activationConstraint: { delay: 200, tolerance: 5 }
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    // Block the synthetic click that follows pointerup so it doesn't open lyrics.
    blockNextDocumentClick()

    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = songs.findIndex((s) => s.id === active.id)
    const newIndex = songs.findIndex((s) => s.id === over.id)
    if (oldIndex !== -1 && newIndex !== -1) {
      onPlaylistSort(oldIndex, newIndex)
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis]}
      onDragEnd={handleDragEnd}
      onDragCancel={blockNextDocumentClick}
    >
      <SortableContext items={songs.map((s) => s.id)} strategy={verticalListSortingStrategy}>
        <div key={playlist.id} className="space-y-2">
          {songs.map((song, index) => (
            <SortableSong
              key={song.id}
              song={song}
              index={index}
              onSongClick={onSongClick}
              onRemoveSong={onRemoveSong}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
