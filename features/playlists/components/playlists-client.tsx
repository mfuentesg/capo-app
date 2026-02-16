"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { Drawer, DrawerContent, DrawerTitle, DrawerDescription } from "@/components/ui/drawer"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, ListMusic, Settings2, X } from "lucide-react"
import { PlaylistList } from "./playlist-list"
import { PlaylistDetail } from "./playlist-detail"
import { PlaylistCreateForm } from "./playlist-create-form"
import type { Playlist } from "../types"
import { useTranslation } from "@/hooks/use-translation"
import { usePlaylists, useCreatePlaylist, useUpdatePlaylist, useDeletePlaylist } from "../hooks"
import { useUser } from "@/features/auth"
import { createOverlayIds } from "@/lib/ui/stable-overlay-ids"

export function PlaylistsClient() {
  const { data: playlists = [] } = usePlaylists()
  const { data: user } = useUser()
  const createPlaylistMutation = useCreatePlaylist()
  const updatePlaylistMutation = useUpdatePlaylist()
  const deletePlaylistMutation = useDeletePlaylist()
  const { t } = useTranslation()
  const [isMobile, setIsMobile] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "drafts" | "completed">("all")
  const [filterVisibility, setFilterVisibility] = useState<"all" | "public" | "private">("all")
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null)
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const filterPopoverIds = createOverlayIds("playlists-filter-popover")
  const resizeHandleIds = createOverlayIds("playlists-layout-resize")
  const mobileDrawerIds = createOverlayIds("playlists-mobile-drawer")

  const selectedPlaylist = selectedPlaylistId
    ? (playlists.find((p) => p.id === selectedPlaylistId) ?? null)
    : null

  // Track viewport to render Drawer only after mount and on mobile
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)")
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [])

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filterStatus !== "all") count++
    if (filterVisibility !== "all") count++
    return count
  }, [filterStatus, filterVisibility])

  // Clear all filters
  const clearAllFilters = () => {
    setFilterStatus("all")
    setFilterVisibility("all")
  }

  const handleSelectPlaylist = (playlist: Playlist) => {
    setIsCreating(false)
    setSelectedPlaylistId(playlist.id)
    setIsMobileDrawerOpen(true)
  }

  const handleClosePlaylistDetail = () => {
    setSelectedPlaylistId(null)
    setIsCreating(false)
    setIsMobileDrawerOpen(false)
  }

  const handleCreateClick = () => {
    setSelectedPlaylistId(null)
    setIsCreating(true)
    setIsMobileDrawerOpen(true)
  }

  const handleCreateSubmit = async (playlist: Playlist) => {
    if (!user?.id) return
    const created = await createPlaylistMutation.mutateAsync({ playlist, userId: user.id })
    setIsCreating(false)
    setSelectedPlaylistId(created.id)
  }

  const handleCreateCancel = () => {
    setIsCreating(false)
    setIsMobileDrawerOpen(false)
  }

  return (
    <div className="h-[calc(100vh-4rem)] bg-background">
      <ResizablePanelGroup id="playlists-layout-group" direction="horizontal" className="h-full">
        <ResizablePanel
          id="playlists-list-panel"
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
                <Badge variant="secondary">{playlists.length}</Badge>
              </div>
              <Button size="sm" className="gap-1.5 rounded-full" onClick={handleCreateClick}>
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
                  <Button
                    variant="outline"
                    size="sm"
                    className="relative gap-2 shrink-0"
                    id={filterPopoverIds.triggerId}
                    aria-controls={filterPopoverIds.contentId}
                  >
                    <Settings2 className="h-4 w-4" />
                    <span className="hidden sm:inline">{t.songs.filters}</span>
                    {activeFilterCount > 0 && (
                      <Badge variant="default" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                        {activeFilterCount}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-80 max-h-125 overflow-y-auto"
                  align="end"
                  id={filterPopoverIds.contentId}
                  aria-labelledby={filterPopoverIds.triggerId}
                >
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
              playlists={playlists}
              searchQuery={searchQuery}
              filterStatus={filterStatus}
              filterVisibility={filterVisibility}
              selectedPlaylistId={selectedPlaylistId}
              onSelectPlaylist={handleSelectPlaylist}
            />
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle className="hidden md:flex" id={resizeHandleIds.handleId} />

        <ResizablePanel
          id="playlists-detail-panel"
          defaultSize={65}
          minSize={40}
          className="hidden md:flex"
        >
          {isCreating ? (
            <PlaylistCreateForm onSubmit={handleCreateSubmit} onCancel={handleCreateCancel} />
          ) : selectedPlaylist ? (
            <PlaylistDetail
              playlist={selectedPlaylist}
              onClose={handleClosePlaylistDetail}
              onUpdate={(playlistId, updates) =>
                updatePlaylistMutation.mutate({ playlistId, updates })
              }
              onDelete={(id) => {
                deletePlaylistMutation.mutate(id)
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

      {isMobile && (
        <Drawer open={isMobileDrawerOpen} onOpenChange={setIsMobileDrawerOpen}>
          <DrawerContent
            className="flex flex-col mt-0! max-h-dvh! p-0 overflow-hidden"
            id={mobileDrawerIds.contentId}
          >
            <DrawerTitle className="sr-only">
              {t.playlists.playlistDetails}
            </DrawerTitle>
            <DrawerDescription className="sr-only">
              {t.playlistDetail.editDescription}
            </DrawerDescription>
            <div className="flex-1 overflow-y-auto">
              {isCreating ? (
                <PlaylistCreateForm onSubmit={handleCreateSubmit} onCancel={handleCreateCancel} />
              ) : selectedPlaylist ? (
                <PlaylistDetail
                  playlist={selectedPlaylist}
                  onClose={handleClosePlaylistDetail}
                  onUpdate={(playlistId, updates) =>
                    updatePlaylistMutation.mutate({ playlistId, updates })
                  }
                  onDelete={(id) => {
                    deletePlaylistMutation.mutate(id)
                    handleClosePlaylistDetail()
                  }}
                />
              ) : null}
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  )
}
