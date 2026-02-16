"use client"

import { useState } from "react"
import { ListMusic } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from "@/components/ui/drawer"
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
import { useTranslation } from "@/hooks/use-translation"
import { createOverlayIds } from "@/lib/ui/stable-overlay-ids"

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
  const { t } = useTranslation()
  const drawerIds = createOverlayIds("playlist-draft-drawer")

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
    <Drawer open={isOpen} onOpenChange={onOpenChange} shouldScaleBackground>
      <DrawerTrigger asChild>
        <div className="fixed bottom-6 right-6 z-50">
          <div className="relative">
            <Button
              className="h-14 w-14 rounded-full shadow-lg p-0 flex items-center justify-center"
              size="lg"
              aria-label={t.playlistDraft.openDraft}
              id={drawerIds.triggerId}
              aria-controls={drawerIds.contentId}
            >
              {/* Music playlist icon */}
              <ListMusic className="h-6 w-6" />
            </Button>

            {/* Song count badge - positioned outside top-right */}
            <span className="absolute -top-2 -right-2 flex h-8 w-8">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-600 dark:bg-orange-500 opacity-75"></span>
              <span className="relative inline-flex items-center justify-center rounded-full h-8 w-8 bg-orange-600 dark:bg-orange-500 text-white text-sm font-bold shadow-lg border-2 border-background">
                {songs.length}
              </span>
            </span>
          </div>
        </div>
      </DrawerTrigger>
      <DrawerContent
        className="flex flex-col mt-0! max-h-dvh! p-0 overflow-hidden"
        id={drawerIds.contentId}
      >
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2">
            <ListMusic className="h-5 w-5" />
            {t.playlistDraft.addToPlaylist}
          </DrawerTitle>
          <DrawerDescription>
            {songs.length} {t.playlistDraft.songsSelected}
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto py-4 px-4">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="playlist-draft">
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={`space-y-3 ${snapshot.isDraggingOver ? "bg-accent/30" : ""}`}
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

        <DrawerFooter className="flex-col gap-2">
          <Select value={selectedPlaylist} onValueChange={setSelectedPlaylist}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t.playlistDraft.selectPlaylist} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">{t.playlistDraft.selectNewPlaylist}</SelectItem>
              <SelectItem value="domingo-7">{t.playlistDraft.exampleSunday7}</SelectItem>
              <SelectItem value="domingo-14">{t.playlistDraft.exampleSunday14}</SelectItem>
              <SelectItem value="navidad">{t.playlistDraft.exampleChristmas}</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2 w-full">
            <DrawerClose asChild>
              <Button
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={onClear}
                suppressHydrationWarning
              >
                {t.playlistDraft.clearButton}
              </Button>
            </DrawerClose>
            <Button className="flex-1" suppressHydrationWarning>
              {t.playlistDraft.addButton.replace("{count}", songs.length.toString())}
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
