"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { Drawer, DrawerContent, DrawerTitle, DrawerDescription } from "@/components/ui/drawer"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Music, LayoutList, Music2, Music3, Settings2, X } from "lucide-react"
import { SongList } from "@/features/songs/components/song-list"
import { SongDetail } from "@/features/songs/components/song-detail"
import { SongDraftForm } from "@/features/song-draft"
import { useCreateSong, useUpdateSong, useDeleteSong } from "@/features/songs/hooks/use-songs"
import { useUser } from "@/features/auth"
import type { Song, GroupBy } from "@/features/songs/types"
import { useTranslation } from "@/hooks/use-translation"

interface SongsClientProps {
  initialSongs: Song[]
}

type BPMRange = "all" | "slow" | "medium" | "fast"

export function SongsClient({ initialSongs }: SongsClientProps) {
  const { t } = useTranslation()
  const { data: user } = useUser()
  const createSongMutation = useCreateSong()
  const updateSongMutation = useUpdateSong()
  const deleteSongMutation = useDeleteSong()
  const [isMobile, setIsMobile] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSong, setSelectedSong] = useState<Song | null>(null)
  const [groupBy, setGroupBy] = useState<GroupBy>("none")
  const [filterStatus, setFilterStatus] = useState<"all" | "drafts" | "completed" | "all">("all")
  const [bpmRange, setBpmRange] = useState<BPMRange>("all")
  const [songs, setSongs] = useState<Song[]>(initialSongs)
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false)
  const [isCreatingNewSong, setIsCreatingNewSong] = useState(false)
  const [previewSong, setPreviewSong] = useState<Song | null>(null)

  // Track viewport to render Drawer only after mount and on mobile
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)")
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [])

  const updateSong = (songId: string, updates: Partial<Song>) => {
    // Optimistic local update for instant UX
    setSongs((prev) => prev.map((song) => (song.id === songId ? { ...song, ...updates } : song)))
    if (selectedSong?.id === songId) {
      setSelectedSong((prev) => (prev ? { ...prev, ...updates } : null))
    }
    // Persist to database
    updateSongMutation.mutate({ songId, updates })
  }

  const handleDeleteSong = (songId: string) => {
    deleteSongMutation.mutate(songId)
    setSongs((prev) => prev.filter((song) => song.id !== songId))
    setSelectedSong(null)
    setIsMobileDrawerOpen(false)
  }

  const handleSelectSong = (song: Song) => {
    // Prevent selection when creating a new song
    if (isCreatingNewSong) return

    setSelectedSong(song)
    setIsMobileDrawerOpen(true)
  }

  const handleCloseSongDetail = () => {
    setSelectedSong(null)
    setIsMobileDrawerOpen(false)
    setIsCreatingNewSong(false)
    setPreviewSong(null)
  }

  const handleCreateNewSong = () => {
    const previewId = `preview-${Date.now()}`
    const newPreview: Song = {
      id: previewId,
      title: "",
      artist: "",
      key: "",
      bpm: 0
    }
    setPreviewSong(newPreview)
    setSelectedSong(newPreview)
    setIsCreatingNewSong(true)
    setIsMobileDrawerOpen(true)
  }

  const handleUpdatePreview = (updates: Partial<Song>) => {
    if (previewSong) {
      setPreviewSong((prev) => (prev ? { ...prev, ...updates } : null))
      setSelectedSong((prev) => (prev ? { ...prev, ...updates } : null))
    }
  }

  const handleSaveSong = async (song: Song) => {
    if (!user?.id) {
      return // User not authenticated
    }
    try {
      const createdSong = await createSongMutation.mutateAsync({ song, userId: user.id })
      setSongs((prev) => [createdSong, ...prev])
      setIsCreatingNewSong(false)
      setPreviewSong(null)
      setSelectedSong(createdSong)
      // Keep drawer open on mobile to show the new song detail
      setIsMobileDrawerOpen(true)
    } catch {
      // Error is handled by the mutation's onError callback (toast)
      // Keep the form open so user can retry
    }
  }

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

  return (
    <div className="h-[calc(100vh-4rem)] bg-background">
      <ResizablePanelGroup id="songs-layout-group" direction="horizontal" className="h-full">
        <ResizablePanel
          id="songs-list-panel"
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
              <Button
                size="sm"
                className="gap-1.5 rounded-full"
                onClick={handleCreateNewSong}
                disabled={isCreatingNewSong}
              >
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
                    <span className="hidden sm:inline">{t.songs.filters}</span>
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
                        <h4 className="font-medium leading-none">{t.songs.filters}</h4>
                        <p className="text-xs text-muted-foreground">
                          {t.songs.filtersDescription}
                        </p>
                      </div>
                      {activeFilterCount > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={clearAllFilters}
                        >
                          {t.filters.clearAll}
                        </Button>
                      )}
                    </div>

                    <Separator />

                    {/* Status Filter */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Music className="h-4 w-4" />
                        <span className="text-sm font-medium">{t.songs.status}</span>
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
              previewSong={previewSong}
              selectedSong={selectedSong}
              searchQuery={searchQuery}
              groupBy={groupBy}
              isCreatingNewSong={isCreatingNewSong}
              onSelectSong={handleSelectSong}
            />
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle className="hidden md:flex" />

        <ResizablePanel
          id="songs-detail-panel"
          defaultSize={65}
          minSize={40}
          className="hidden md:flex"
        >
          {isCreatingNewSong ? (
            <SongDraftForm
              song={previewSong || undefined}
              onClose={() => {
                setIsCreatingNewSong(false)
                setPreviewSong(null)
                setSelectedSong(null)
              }}
              onSave={handleSaveSong}
              onChange={handleUpdatePreview}
            />
          ) : selectedSong ? (
            <SongDetail
              song={selectedSong}
              onClose={handleCloseSongDetail}
              onUpdate={updateSong}
              onDelete={handleDeleteSong}
            />
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

      {isMobile && (
        <Drawer
          open={isMobileDrawerOpen}
          onOpenChange={(open) => {
            if (!open) {
              handleCloseSongDetail()
            }
          }}
        >
          <DrawerContent className="flex flex-col mt-0! max-h-dvh! p-0 overflow-hidden">
            <DrawerTitle className="sr-only">
              {isCreatingNewSong ? t.songs.createSong : t.songs.songDetails}
            </DrawerTitle>
            <DrawerDescription className="sr-only">
              {isCreatingNewSong ? t.songs.enterSongDetails : t.songs.selectSongDescription}
            </DrawerDescription>
            <div className="flex-1 overflow-y-auto">
              {isCreatingNewSong ? (
                <SongDraftForm
                  song={previewSong || undefined}
                  onClose={handleCloseSongDetail}
                  onSave={handleSaveSong}
                  onChange={handleUpdatePreview}
                />
              ) : selectedSong ? (
                <SongDetail
                  song={selectedSong}
                  onClose={handleCloseSongDetail}
                  onUpdate={updateSong}
                  onDelete={handleDeleteSong}
                />
              ) : null}
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  )
}
