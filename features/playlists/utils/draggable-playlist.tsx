"use client"

import { memo } from "react"
import { GripVerticalIcon } from "lucide-react"
import { DragDropContext, Droppable, DropResult, Draggable } from "@hello-pangea/dnd"

import { PlaylistSongItem } from "../components/playlist-song-item"
import { type SongWithPosition, type PlaylistWithSongs } from "@/types/extended"

const DraggableSong = memo(({ index, song }: { index: number; song: SongWithPosition }) => {
  return (
    <Draggable draggableId={song.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`relative ${snapshot.isDragging ? "opacity-70 z-50" : ""}`}
        >
          <div className="relative" {...provided.dragHandleProps}>
            <PlaylistSongItem song={song} index={index} showDragHandle />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing">
              <GripVerticalIcon className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-foreground" />
            </div>
          </div>
        </div>
      )}
    </Draggable>
  )
})

DraggableSong.displayName = "DraggableSong"

export function DraggablePlaylist({
  playlist,
  songs,
  onPlaylistSort
}: {
  playlist: PlaylistWithSongs
  songs: SongWithPosition[]
  onPlaylistSort: (s: number, d: number) => Promise<void>
}) {
  const handleDragEnd = async (result: DropResult<string>) => {
    const { destination, source } = result
    if (!destination) {
      return
    }
    const isSamePosition =
      destination.droppableId === source.droppableId && destination.index === source.index
    const isSamePlaylist = destination.droppableId === source.droppableId
    if (isSamePosition || !isSamePlaylist) {
      return
    }

    onPlaylistSort(source.index, destination.index)
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div key={playlist.id} className="space-y-2">
        <Droppable droppableId={playlist.id} isCombineEnabled>
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className={`space-y-2 ${snapshot.isDraggingOver ? "bg-accent/30" : ""}`}
            >
              {songs.map((song, index) => {
                return (
                  <div className="relative" key={song.id}>
                    <DraggableSong song={song} index={index} />
                  </div>
                )
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    </DragDropContext>
  )
}
