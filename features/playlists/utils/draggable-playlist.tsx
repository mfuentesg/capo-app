"use client"

import { memo, useRef, useState } from "react"
import { GripVerticalIcon, Trash2 } from "lucide-react"
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

const SWIPE_DELETE_THRESHOLD = -80
const SWIPE_MAX = -120

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

    const [swipeOffset, setSwipeOffset] = useState(0)
    const [isAnimating, setIsAnimating] = useState(false)
    const swipeStartX = useRef<number | null>(null)
    const didSwipe = useRef(false)

    const sortStyle = {
      transform: CSS.Transform.toString(transform),
      transition
    }

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
      if (isDragging || !onRemoveSong) return
      // Ignore events that originate from the drag handle — those belong to @dnd-kit
      if ((e.target as HTMLElement).closest("[data-drag-handle]")) return
      ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
      swipeStartX.current = e.clientX
      didSwipe.current = false
    }

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
      if (swipeStartX.current === null || isDragging || !onRemoveSong) return
      const delta = e.clientX - swipeStartX.current
      if (delta < -8) {
        didSwipe.current = true
        setIsAnimating(false)
        setSwipeOffset(Math.max(delta, SWIPE_MAX))
      }
    }

    const handlePointerUp = () => {
      if (swipeStartX.current === null) return
      swipeStartX.current = null
      const wasSwiped = didSwipe.current
      didSwipe.current = false

      if (!wasSwiped) return

      blockNextDocumentClick()

      if (swipeOffset < SWIPE_DELETE_THRESHOLD) {
        onRemoveSong?.(song.id)
      } else {
        setIsAnimating(true)
        setSwipeOffset(0)
      }
    }

    const showDeleteIndicator = swipeOffset < -20

    return (
      <div
        ref={setNodeRef}
        style={sortStyle}
        {...attributes}
        className={`relative overflow-hidden rounded-lg ${isDragging ? "opacity-70 z-50" : ""}`}
      >
        {/* Delete indicator revealed by swipe */}
        <div
          className={`absolute inset-0 flex items-center justify-end bg-destructive px-4 transition-opacity ${showDeleteIndicator ? "opacity-100" : "opacity-0"}`}
        >
          <Trash2 className="h-4 w-4 text-destructive-foreground" />
        </div>

        {/* Song row — slides left on swipe */}
        <div
          className={`relative ${isAnimating ? "transition-transform duration-200 ease-out" : ""}`}
          style={{ transform: `translateX(${swipeOffset}px)` }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onTransitionEnd={() => setIsAnimating(false)}
          onClick={() => onSongClick?.(index)}
        >
          <PlaylistSongItem song={song} index={index} showDragHandle />
          <div
            data-drag-handle
            className="absolute right-4 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing touch-none"
            {...listeners}
          >
            <GripVerticalIcon className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-foreground" />
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
      activationConstraint: { distance: 8 }
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    // Always block the synthetic click that follows pointerup, regardless of
    // whether the drop resulted in a reorder.
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
