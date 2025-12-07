"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { Drawer, DrawerContent, DrawerTitle, DrawerDescription } from "@/components/ui/drawer"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, ListMusic, Settings2, X, Info } from "lucide-react"
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
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "drafts" | "completed">("all")
  const [filterVisibility, setFilterVisibility] = useState<"all" | "public" | "private">("all")
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null)
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false)

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filterStatus !== "all") count++
    if (filterVisibility !== "all") count++
    return count
  }, [filterStatus, filterVisibility])

  // Remove filter helper
  const removeFilter = (type: string) => {
    if (type === "status") setFilterStatus("all")
    if (type === "visibility") setFilterVisibility("all")
  }

  // Clear all filters
  const clearAllFilters = () => {
    setFilterStatus("all")
    setFilterVisibility("all")
  }

  // Track viewport to render Drawer only on mobile (md: 768px)
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)")
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [])

  const handleSelectPlaylist = (playlist: Playlist) => {
    setSelectedPlaylist(playlist)
    setIsMobileDrawerOpen(true)
  }

  const handleClosePlaylistDetail = () => {
    setSelectedPlaylist(null)
    setIsMobileDrawerOpen(false)
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
                  {t.playlists.title}
                </h1>
                <Badge variant="secondary">{initialPlaylists.length}</Badge>
              </div>
              <Button size="sm" className="gap-1.5 rounded-full">
                <Plus className="h-4 w-4" />
                {t.playlists.createPlaylist}
              </Button>
            </div>

            <div className="relative mt-4 flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder={`${t.common.search} ${t.playlists.title.toLowerCase()}...`}
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
                    <span className="hidden sm:inline">Filters</span>
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
                      <span className="text-sm font-medium">{t.songs.status}</span>
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
                          {t.playlists.drafts}
                        </Button>
                        <Button
                          onClick={() => setFilterStatus("completed")}
                          variant={filterStatus === "completed" ? "default" : "outline"}
                          size="sm"
                          className="justify-center"
                        >
                          {t.playlists.completed}
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    {/* Visibility Filter */}
                    <div className="space-y-2">
                      <span className="text-sm font-medium">{t.filters.visibility}</span>
                      <div className="grid grid-cols-3 gap-2">
                        <Button
                          onClick={() => setFilterVisibility("all")}
                          variant={filterVisibility === "all" ? "default" : "outline"}
                          size="sm"
                          className="justify-center"
                        >
                          {t.songs.all}
                        </Button>
                        <Button
                          onClick={() => setFilterVisibility("public")}
                          variant={filterVisibility === "public" ? "default" : "outline"}
                          size="sm"
                          className="justify-center"
                        >
                          {t.filters.public}
                        </Button>
                        <Button
                          onClick={() => setFilterVisibility("private")}
                          variant={filterVisibility === "private" ? "default" : "outline"}
                          size="sm"
                          className="justify-center"
                        >
                          {t.filters.private}
                        </Button>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <PlaylistList
              playlists={initialPlaylists}
              searchQuery={searchQuery}
              filterStatus={filterStatus}
              filterVisibility={filterVisibility}
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

      {/* Mobile Drawer for Playlist Detail */}
      {isMobile && (
        <Drawer open={isMobileDrawerOpen} onOpenChange={setIsMobileDrawerOpen}>
          <DrawerContent className="h-[95vh] max-h-[95vh]">
            <DrawerTitle className="sr-only">Playlist Details</DrawerTitle>
            <DrawerDescription className="sr-only">View and edit playlist</DrawerDescription>
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
          </DrawerContent>
        </Drawer>
      )}
    </div>
  )
}
