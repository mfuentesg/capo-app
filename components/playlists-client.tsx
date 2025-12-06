"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Plus, Search, ListMusic } from "lucide-react"
import { PlaylistList } from "@/components/playlist-list"
import { PlaylistDetail } from "@/components/playlist-detail"
import type { Playlist } from "@/types"
import { useTranslation } from "@/hooks/use-translation"

interface PlaylistsClientProps {
  initialPlaylists: Playlist[]
  onUpdatePlaylist: (id: string, updates: Partial<Playlist>) => void
  onDeletePlaylist: (id: string) => void
}

export function PlaylistsClient({
  initialPlaylists,
  onUpdatePlaylist,
  onDeletePlaylist
}: PlaylistsClientProps) {
  const { t } = useTranslation()
  const [isMobile, setIsMobile] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null)
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false)

  // Track viewport to render Sheet only on mobile (md: 768px)
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)")
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [])

  const handleSelectPlaylist = (playlist: Playlist) => {
    setSelectedPlaylist(playlist)
    setIsMobileSheetOpen(true)
  }

  const handleClosePlaylistDetail = () => {
    setSelectedPlaylist(null)
    setIsMobileSheetOpen(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <ResizablePanelGroup direction="horizontal" className="h-[calc(100vh-4rem)]">
        <ResizablePanel
          defaultSize={35}
          minSize={25}
          maxSize={50}
          className="flex flex-col border-r bg-background"
        >
          <div className="shrink-0 border-b p-4 lg:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-semibold tracking-tight lg:text-2xl">
                  {t.playlists.title}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {initialPlaylists.length} {t.playlists.title.toLowerCase()}
                </p>
              </div>
              <Button size="sm" className="gap-1.5">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">{t.playlists.createPlaylist}</span>
              </Button>
            </div>

            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={`${t.common.search} ${t.playlists.title.toLowerCase()}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 bg-muted/50"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <PlaylistList
              playlists={initialPlaylists}
              searchQuery={searchQuery}
              onSelectPlaylist={handleSelectPlaylist}
            />
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle className="hidden md:flex" />

        <ResizablePanel defaultSize={65} minSize={40} className="hidden md:flex">
          {selectedPlaylist ? (
            <PlaylistDetail
              playlist={selectedPlaylist}
              onClose={handleClosePlaylistDetail}
              onUpdate={onUpdatePlaylist}
              onDelete={(id) => {
                onDeletePlaylist(id)
                handleClosePlaylistDetail()
              }}
            />
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center bg-muted/30 p-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <ListMusic className="h-7 w-7 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-medium">{t.playlists.selectPlaylist}</h3>
              <p className="mt-1 text-sm text-muted-foreground max-w-xs">
                {t.playlists.selectPlaylistDescription}
              </p>
            </div>
          )}
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* Mobile Sheet for Playlist Detail */}
      {isMobile && (
        <Sheet open={isMobileSheetOpen} onOpenChange={setIsMobileSheetOpen}>
          <SheetContent
            side="bottom"
            className="h-full max-h-dvh overflow-y-auto p-0 md:hidden [&>button]:hidden"
          >
            <SheetTitle className="sr-only">
              {selectedPlaylist ? `Edit ${selectedPlaylist.name}` : "Playlist Details"}
            </SheetTitle>
            <SheetDescription className="sr-only">
              View and edit playlist information, manage songs, and delete playlist
            </SheetDescription>
            {selectedPlaylist && (
              <PlaylistDetail
                playlist={selectedPlaylist}
                onClose={handleClosePlaylistDetail}
                onUpdate={onUpdatePlaylist}
                onDelete={(id) => {
                  onDeletePlaylist(id)
                  handleClosePlaylistDetail()
                }}
              />
            )}
          </SheetContent>
        </Sheet>
      )}
    </div>
  )
}
