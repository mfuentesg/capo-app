"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Plus, Search, Music, LayoutList } from "lucide-react"
import { SongList } from "@/components/song-list"
import { SongDetail } from "@/components/song-detail"
import type { Song, GroupBy } from "@/types"
import { useTranslation } from "@/hooks/use-translation"

interface SongsClientProps {
  initialSongs: Song[]
}

export function SongsClient({ initialSongs }: SongsClientProps) {
  const { t } = useTranslation()
  const [isMobile, setIsMobile] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSong, setSelectedSong] = useState<Song | null>(null)
  const [groupBy, setGroupBy] = useState<GroupBy>("none")
  const [songs, setSongs] = useState<Song[]>(initialSongs)
  // Initialize with false to ensure sheet is closed on mount
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false)

  // Track viewport to render Sheet only on mobile (md: 768px)
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)")
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [])

  const updateSong = (songId: string, updates: Partial<Song>) => {
    setSongs((prev) => prev.map((song) => (song.id === songId ? { ...song, ...updates } : song)))
    if (selectedSong?.id === songId) {
      setSelectedSong((prev) => (prev ? { ...prev, ...updates } : null))
    }
  }

  const handleSelectSong = (song: Song) => {
    setSelectedSong(song)
    setIsMobileSheetOpen(true)
  }

  const handleCloseSongDetail = () => {
    setSelectedSong(null)
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
                  {t.songs.title}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {songs.length} {t.songs.title.toLowerCase()}
                </p>
              </div>
              <Button size="sm" className="gap-1.5">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">{t.songs.addSong}</span>
              </Button>
            </div>

            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t.songs.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 bg-muted/50"
              />
            </div>

            <div className="mt-4 flex items-center gap-3">
              <LayoutList className="h-4 w-4 text-muted-foreground" />
              <Tabs value={groupBy} onValueChange={(v) => setGroupBy(v as GroupBy)}>
                <TabsList className="h-8">
                  <TabsTrigger value="none" className="text-xs px-3 h-6">
                    {t.songs.all}
                  </TabsTrigger>
                  <TabsTrigger value="key" className="text-xs px-3 h-6">
                    {t.songs.byKey}
                  </TabsTrigger>
                  <TabsTrigger value="artist" className="text-xs px-3 h-6">
                    {t.songs.byArtist}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <SongList
              songs={songs}
              searchQuery={searchQuery}
              groupBy={groupBy}
              onSelectSong={handleSelectSong}
            />
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle className="hidden md:flex" />

        <ResizablePanel defaultSize={65} minSize={40} className="hidden md:flex">
          {selectedSong ? (
            <SongDetail song={selectedSong} onClose={handleCloseSongDetail} onUpdate={updateSong} />
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center bg-muted/30 p-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Music className="h-7 w-7 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-medium">{t.songs.selectSong}</h3>
              <p className="mt-1 text-sm text-muted-foreground max-w-xs">
                {t.songs.selectSongDescription}
              </p>
            </div>
          )}
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* Mobile-only Sheet for Song Detail (do not render on desktop to avoid overlay) */}
      {isMobile && (
        <Sheet
          open={isMobileSheetOpen}
          onOpenChange={(open) => {
            if (!open) {
              handleCloseSongDetail()
            }
          }}
        >
          <SheetContent
            side="bottom"
            className="h-full max-h-dvh overflow-y-auto p-0 [&>button]:hidden"
          >
            <SheetTitle className="sr-only">
              {selectedSong ? `Edit ${selectedSong.title}` : "Song Details"}
            </SheetTitle>
            <SheetDescription className="sr-only">
              View and edit song information, add to playlist, or view lyrics
            </SheetDescription>
            {selectedSong && (
              <SongDetail
                song={selectedSong}
                onClose={handleCloseSongDetail}
                onUpdate={updateSong}
              />
            )}
          </SheetContent>
        </Sheet>
      )}
    </div>
  )
}
