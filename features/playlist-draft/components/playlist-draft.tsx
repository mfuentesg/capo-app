"use client"

import { useState } from "react"
import { ListMusic } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import {
  Drawer,
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
import type { Playlist } from "@/features/playlists"
import { useTranslation } from "@/hooks/use-translation"
import { useIsMobile } from "@/hooks/use-mobile"
import { createOverlayIds } from "@/lib/ui/stable-overlay-ids"

type SubmitSelection =
  | { type: "new"; name: string }
  | { type: "existing"; playlistId: string }

interface PlaylistDraftProps {
  songs: Song[]
  playlists: Playlist[]
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onClear: () => void
  onRemove: (songId: string) => void
  onReorder?: (sourceIndex: number, destinationIndex: number) => void
  onSubmit: (selection: SubmitSelection) => Promise<void>
  isSubmitting?: boolean
}

interface PlaylistDraftBodyProps {
  songs: Song[]
  playlists: Playlist[]
  selectedPlaylist: string
  onSelectPlaylist: (value: string) => void
  newPlaylistName: string
  onNewPlaylistNameChange: (value: string) => void
  onRemove: (songId: string) => void
  onDragEnd: (result: DropResult) => void
}

function PlaylistDraftBody({
  songs,
  playlists,
  selectedPlaylist,
  onSelectPlaylist,
  newPlaylistName,
  onNewPlaylistNameChange,
  onRemove,
  onDragEnd
}: PlaylistDraftBodyProps) {
  const { t } = useTranslation()

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
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

      <Select value={selectedPlaylist} onValueChange={onSelectPlaylist}>
        <SelectTrigger className="w-full mt-4">
          <SelectValue placeholder={t.playlistDraft.selectPlaylist} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="new">{t.playlistDraft.selectNewPlaylist}</SelectItem>
          {playlists.map((playlist) => (
            <SelectItem key={playlist.id} value={playlist.id}>
              {playlist.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedPlaylist === "new" && (
        <Input
          className="mt-2"
          placeholder={t.playlists.playlistNamePlaceholder}
          value={newPlaylistName}
          onChange={(e) => onNewPlaylistNameChange(e.target.value)}
        />
      )}
    </>
  )
}

export function PlaylistDraft({
  songs,
  playlists,
  isOpen,
  onOpenChange,
  onClear,
  onRemove,
  onReorder,
  onSubmit,
  isSubmitting = false
}: PlaylistDraftProps) {
  const [selectedPlaylist, setSelectedPlaylist] = useState<string>("new")
  const [newPlaylistName, setNewPlaylistName] = useState("")
  const { t } = useTranslation()
  const isMobile = useIsMobile()
  const drawerIds = createOverlayIds("playlist-draft-drawer")

  if (songs.length === 0) {
    return null
  }

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || result.source.index === result.destination.index) {
      return
    }
    onReorder?.(result.source.index, result.destination.index)
  }

  const isAddDisabled =
    isSubmitting || (selectedPlaylist === "new" && !newPlaylistName.trim())

  const handleAdd = async () => {
    if (selectedPlaylist === "new") {
      await onSubmit({ type: "new", name: newPlaylistName.trim() })
    } else {
      await onSubmit({ type: "existing", playlistId: selectedPlaylist })
    }
  }

  const handleClear = () => {
    onClear()
    onOpenChange(false)
  }

  const trigger = (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="relative">
        <Button
          className="h-14 w-14 rounded-full shadow-lg p-0 flex items-center justify-center"
          size="lg"
          aria-label={t.playlistDraft.openDraft}
          id={drawerIds.triggerId}
          aria-controls={drawerIds.contentId}
        >
          <ListMusic className="h-6 w-6" />
        </Button>
        <span className="absolute -top-2 -right-2 flex h-8 w-8">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-600 dark:bg-orange-500 opacity-75"></span>
          <span className="relative inline-flex items-center justify-center rounded-full h-8 w-8 bg-orange-600 dark:bg-orange-500 text-white text-sm font-bold shadow-lg border-2 border-background">
            {songs.length}
          </span>
        </span>
      </div>
    </div>
  )

  const actionButtons = (
    <div className="flex gap-2 w-full">
      <Button
        variant="outline"
        className="flex-1 bg-transparent"
        onClick={handleClear}
        suppressHydrationWarning
      >
        {t.playlistDraft.clearButton}
      </Button>
      <Button
        className="flex-1"
        disabled={isAddDisabled}
        onClick={handleAdd}
        suppressHydrationWarning
      >
        {t.playlistDraft.addButton.replace("{count}", songs.length.toString())}
      </Button>
    </div>
  )

  const bodyProps: PlaylistDraftBodyProps = {
    songs,
    playlists,
    selectedPlaylist,
    onSelectPlaylist: setSelectedPlaylist,
    newPlaylistName,
    onNewPlaylistNameChange: setNewPlaylistName,
    onRemove,
    onDragEnd: handleDragEnd
  }

  if (!isMobile) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent className="sm:max-w-md flex flex-col max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ListMusic className="h-5 w-5" />
              {t.playlistDraft.addToPlaylist}
            </DialogTitle>
            <DialogDescription>
              {songs.length} {t.playlistDraft.songsSelected}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto py-2">
            <PlaylistDraftBody {...bodyProps} />
          </div>
          <div className="flex flex-col gap-2 pt-4">{actionButtons}</div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange} shouldScaleBackground>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
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
          <PlaylistDraftBody {...bodyProps} />
        </div>
        <DrawerFooter className="flex-col gap-2">{actionButtons}</DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
