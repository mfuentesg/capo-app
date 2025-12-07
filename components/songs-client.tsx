"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { Drawer, DrawerContent, DrawerTitle, DrawerDescription } from "@/components/ui/drawer"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  Search,
  Music,
  LayoutList,
  Music2,
  Music3,
  Settings2,
  X,
  ArrowUpDown
} from "lucide-react"
import { SongList } from "@/components/song-list"
import { SongDetail } from "@/components/song-detail"
import type { Song, GroupBy } from "@/types"
import { useTranslation } from "@/hooks/use-translation"

interface SongsClientProps {
  initialSongs: Song[]
}

type SortBy = "name" | "artist" | "date" | "bpm"
type BPMRange = "all" | "slow" | "medium" | "fast"

export function SongsClient({ initialSongs }: SongsClientProps) {
  const { t } = useTranslation()
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSong, setSelectedSong] = useState<Song | null>(null)
  const [groupBy, setGroupBy] = useState<GroupBy>("none")
  const [filterStatus, setFilterStatus] = useState<"all" | "drafts" | "completed">("all")
  const [selectedKeys, setSelectedKeys] = useState<string[]>([])
  const [selectedArtists, setSelectedArtists] = useState<string[]>([])
  const [bpmRange, setBpmRange] = useState<BPMRange>("all")
  const [sortBy, setSortBy] = useState<SortBy>("name")
  const [songs, setSongs] = useState<Song[]>(initialSongs)
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false)

  // Track viewport to render Drawer only on mobile (md: 768px)
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
    setIsMobileDrawerOpen(true)
  }

  const handleCloseSongDetail = () => {
    setSelectedSong(null)
    setIsMobileDrawerOpen(false)
  }

  // Get unique keys and artists with counts
  const availableKeys = useMemo(() => {
    const keyCounts = songs.reduce(
      (acc, song) => {
        const key = song.key
        acc[key] = (acc[key] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )
    return Object.entries(keyCounts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, count]) => ({ key, count }))
  }, [songs])

  const availableArtists = useMemo(() => {
    const artistCounts = songs.reduce(
      (acc, song) => {
        const artist = song.artist
        acc[artist] = (acc[artist] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )
    return Object.entries(artistCounts)
      .sort(([, a], [, b]) => b - a) // Sort by count descending
      .slice(0, 10) // Top 10 artists
      .map(([artist, count]) => ({ artist, count }))
  }, [songs])

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filterStatus !== "all") count++
    if (groupBy !== "none") count++
    if (bpmRange !== "all") count++
    return count
  }, [filterStatus, groupBy, bpmRange])

  // Clear all filters
  const clearAllFilters = () => {
    setFilterStatus("all")
    setGroupBy("none")
    setBpmRange("all")
  }

  // Toggle key filter
  const toggleKeyFilter = (key: string) => {
    setSelectedKeys((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]))
  }

  // Toggle artist filter
  const toggleArtistFilter = (artist: string) => {
    setSelectedArtists((prev) =>
      prev.includes(artist) ? prev.filter((a) => a !== artist) : [...prev, artist]
    )
  }

  // Remove individual filter
  const removeFilter = (type: string, value?: string) => {
    if (type === "status") setFilterStatus("all")
    else if (type === "groupBy") setGroupBy("none")
    else if (type === "key" && value) setSelectedKeys((prev) => prev.filter((k) => k !== value))
    else if (type === "artist" && value)
      setSelectedArtists((prev) => prev.filter((a) => a !== value))
    else if (type === "bpm") setBpmRange("all")
    else if (type === "sort") setSortBy("name")
  }

  return (
    <div className="h-[calc(100vh-4rem)] bg-background">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        <ResizablePanel
          defaultSize={35}
          minSize={25}
          maxSize={50}
          className="flex flex-col border-r bg-background"
        >
          <div className="border-b border-r p-4 lg:p-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold tracking-tight lg:text-2xl">
                  {t.songs.title}
                </h1>
                <Badge variant="secondary">{songs.length}</Badge>
              </div>
              <Button size="sm" className="gap-1.5 rounded-full">
                <Plus className="h-4 w-4" />
                {t.songs.addSong}
              </Button>
            </div>

            <div className="relative mt-4 flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder={t.songs.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`pl-9 h-9 bg-muted/50 ${searchQuery ? "pr-9" : "pr-3"}`}
                  suppressHydrationWarning
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="relative gap-2 shrink-0">
                    <Settings2 className="h-4 w-4" />
                    <span className="hidden sm:inline">{t.songs.filters || "Filters"}</span>
                    {activeFilterCount > 0 && (
                      <Badge variant="default" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                        {activeFilterCount}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="w-80 max-h-[500px] overflow-y-auto" align="end">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h4 className="font-medium leading-none">{t.songs.filters || "Filters"}</h4>
                        <p className="text-xs text-muted-foreground">
                          {t.songs.filtersDescription || "Filter and organize your songs"}
                        </p>
                      </div>
                      {activeFilterCount > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={clearAllFilters}
                        >
                          Clear all
                        </Button>
                      )}
                    </div>

                    <Separator />

                    {/* Status Filter */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Music className="h-4 w-4" />
                        <span className="text-sm font-medium">{t.songs.status || "Status"}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <Button
                          onClick={() => setFilterStatus("all")}
                          variant={filterStatus === "all" ? "default" : "outline"}
                          size="sm"
                          className="justify-center"
                        >
                          {t.songs.all}
                        </Button>
                        <Button
                          onClick={() => setFilterStatus("drafts")}
                          variant={filterStatus === "drafts" ? "default" : "outline"}
                          size="sm"
                          className="justify-center"
                        >
                          {t.songs.drafts}
                        </Button>
                        <Button
                          onClick={() => setFilterStatus("completed")}
                          variant={filterStatus === "completed" ? "default" : "outline"}
                          size="sm"
                          className="justify-center"
                        >
                          {t.songs.completed}
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    {/* BPM Range Filter */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Music2 className="h-4 w-4" />
                        <span className="text-sm font-medium">{t.songs.bpmRange}</span>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        <Button
                          onClick={() => setBpmRange("all")}
                          variant={bpmRange === "all" ? "default" : "outline"}
                          size="sm"
                          className="justify-center"
                        >
                          {t.songs.all}
                        </Button>
                        <Button
                          onClick={() => setBpmRange("slow")}
                          variant={bpmRange === "slow" ? "default" : "outline"}
                          size="sm"
                          className="justify-center"
                        >
                          {t.songs.slow}
                        </Button>
                        <Button
                          onClick={() => setBpmRange("medium")}
                          variant={bpmRange === "medium" ? "default" : "outline"}
                          size="sm"
                          className="justify-center"
                        >
                          {t.songs.medium}
                        </Button>
                        <Button
                          onClick={() => setBpmRange("fast")}
                          variant={bpmRange === "fast" ? "default" : "outline"}
                          size="sm"
                          className="justify-center"
                        >
                          {t.songs.fast}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">{t.songs.bpmDescription}</p>
                    </div>

                    <Separator />

                    {/* Group By */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <LayoutList className="h-4 w-4" />
                        <span className="text-sm font-medium">{t.songs.groupBy}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <Button
                          onClick={() => setGroupBy("none")}
                          variant={groupBy === "none" ? "default" : "outline"}
                          size="sm"
                          className="justify-center"
                        >
                          {t.songs.none}
                        </Button>
                        <Button
                          onClick={() => setGroupBy("key")}
                          variant={groupBy === "key" ? "default" : "outline"}
                          size="sm"
                          className="justify-center"
                        >
                          {t.songs.byKey}
                        </Button>
                        <Button
                          onClick={() => setGroupBy("artist")}
                          variant={groupBy === "artist" ? "default" : "outline"}
                          size="sm"
                          className="justify-center"
                        >
                          {t.songs.byArtist}
                        </Button>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Explanation Icon */}
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Music3 className="h-3 w-3" />
              </div>
              <span className="text-xs">{t.songs.selectSongDescription}</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <SongList
              songs={songs}
              searchQuery={searchQuery}
              groupBy={groupBy}
              filterStatus={filterStatus}
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

      {/* Mobile Drawer for Song Detail */}
      {isMobile && (
        <Drawer
          open={isMobileDrawerOpen}
          onOpenChange={(open) => {
            if (!open) {
              handleCloseSongDetail()
            }
          }}
        >
          <DrawerContent className="h-[95vh] max-h-[95vh]">
            <DrawerTitle className="sr-only">Song Details</DrawerTitle>
            <DrawerDescription className="sr-only">
              View and edit song information
            </DrawerDescription>
            {selectedSong && (
              <SongDetail
                song={selectedSong}
                onClose={handleCloseSongDetail}
                onUpdate={updateSong}
              />
            )}
          </DrawerContent>
        </Drawer>
      )}
    </div>
  )
}
