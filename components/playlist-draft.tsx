import { ShoppingCart, ListMusic } from "lucide-react"
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
import { PlaylistDraftItem } from "./playlist-draft-item"
import type { Song } from "@/types"

interface PlaylistDraftProps {
  songs: Song[]
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onClear: () => void
  onRemove: (songId: string) => void
}

export function PlaylistDraft({
  songs,
  isOpen,
  onOpenChange,
  onClear,
  onRemove
}: PlaylistDraftProps) {
  if (songs.length === 0) {
    return null
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button
          className="fixed bottom-6 right-6 z-50 h-14 gap-2 rounded-full pl-5 pr-6 shadow-lg"
          size="lg"
        >
          <ShoppingCart className="h-5 w-5" />
          <span className="font-semibold">{songs.length}</span>
          <span className="hidden sm:inline">songs selected</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ListMusic className="h-5 w-5" />
            Add to Playlist
          </SheetTitle>
          <SheetDescription>{songs.length} songs selected</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4">
          <div className="space-y-2">
            {songs.map((song, index) => (
              <PlaylistDraftItem key={song.id} song={song} index={index} onRemove={onRemove} />
            ))}
          </div>
        </div>

        <SheetFooter className="flex-col gap-2 sm:flex-col">
          <Select>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a playlist..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="domingo-7">Domingo 7 diciembre</SelectItem>
              <SelectItem value="domingo-14">Domingo 14 diciembre</SelectItem>
              <SelectItem value="navidad">Especial de Navidad</SelectItem>
              <SelectItem value="new">+ Create new playlist</SelectItem>
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
