"use client"

import { useState } from "react"
import { Guitar, ListMusic } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter
} from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd"
import { PlaylistDraftItem } from "./playlist-draft-item"
import type { Song } from "@/types"

interface PlaylistDraftProps {
  songs: Song[]
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onClear: () => void
  onRemove: (songId: string) => void
  onReorder?: (sourceIndex: number, destinationIndex: number) => void
}

export function PlaylistDraft({
  songs,
  isOpen,
  onOpenChange,
  onClear,
  onRemove,
  onReorder
}: PlaylistDraftProps) {
  const [selectedPlaylist, setSelectedPlaylist] = useState<string>("new")

  if (songs.length === 0) {
    return null
  }

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return
    }

    if (result.source.index === result.destination.index) {
      return
    }

    onReorder?.(result.source.index, result.destination.index)
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <div className="fixed bottom-6 right-6 z-50">
          <Button className="relative h-14 w-14 rounded-full shadow-lg p-0" size="lg">
            <span className="font-semibold text-base">{songs.length}</span>
            {songs.length > 0 && (
              <span className="absolute inset-0 rounded-full animate-pulse bg-primary/20" />
            )}
          </Button>
        </div>
      </SheetTrigger>
      <SheetContent className="flex flex-col w-full! md:w-3/4!">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ListMusic className="h-5 w-5" />
            Add to Playlist
          </SheetTitle>
          <SheetDescription>{songs.length} songs selected</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="playlist-draft">
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={`space-y-3 px-4 ${snapshot.isDraggingOver ? "bg-accent/30" : ""}`}
                >
                  {songs.map((song, index) => (
                    <Draggable key={song.id} draggableId={song.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={snapshot.isDragging ? "opacity-70 z-50" : ""}
                        >
                          <PlaylistDraftItem song={song} index={index} onRemove={onRemove} />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        <SheetFooter className="flex-col gap-2 sm:flex-col">
          <Select value={selectedPlaylist} onValueChange={setSelectedPlaylist}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a playlist..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">+ Create new playlist</SelectItem>
              <SelectItem value="domingo-7">Domingo 7 diciembre</SelectItem>
              <SelectItem value="domingo-14">Domingo 14 diciembre</SelectItem>
              <SelectItem value="navidad">Especial de Navidad</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2 w-full">
            <Button variant="outline" className="flex-1 bg-transparent" onClick={onClear}>
              Clear
            </Button>
            <Button className="flex-1">Add {songs.length} songs</Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
