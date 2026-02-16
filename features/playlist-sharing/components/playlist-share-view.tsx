"use client"

import Link from "next/link"
import {
  Globe,
  Share2,
  Clock3,
  CirclePlus,
  ListMusic,
  CalendarDays,
  ChevronUp,
  ChevronDown
} from "lucide-react"
import { toast } from "sonner"
import { useEffect, useRef, useState } from "react"
import { useLocale } from "@/features/settings"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { LyricsView } from "@/features/lyrics-editor"
import type { PlaylistWithSongs } from "@/features/playlists/types"
import { formatLongDate } from "@/lib/utils"

interface PlaylistShareViewProps {
  playlist: PlaylistWithSongs
}

export function PlaylistShareView({ playlist }: PlaylistShareViewProps) {
  const { t, locale } = useLocale()
  const playlistPath = playlist.shareCode
    ? `/dashboard/playlists/${playlist.shareCode}`
    : "/dashboard/playlists"
  const [shareUrl, setShareUrl] = useState("")
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const bodyOverflowRef = useRef<string>("")

  const mockSongs: PlaylistWithSongs["songs"] = [
    {
      id: "mock-1",
      title: "Morning Light",
      artist: "Capo Sessions",
      key: "C",
      bpm: 92,
      lyrics:
        "Verse 1\nLight in the morning, calm in the night\nWe carry the melody, keep it in sight\n\nChorus\nSing it out, sing it true\nEvery line a pathway through"
    },
    {
      id: "mock-2",
      title: "Open Skies",
      artist: "Capo Sessions",
      key: "G",
      bpm: 108,
      lyrics:
        "Verse 1\nQuiet streets and open skies\nWe find the rhythm, we let it rise\n\nChorus\nHold the note, let it glow\nEvery song tells us where to go"
    },
    {
      id: "mock-3",
      title: "Lift It High",
      artist: "Capo Sessions",
      key: "D",
      bpm: 116,
      lyrics:
        "Verse 1\nHands on strings and hearts aligned\nWe follow the tempo, leave fear behind\n\nChorus\nLift it up, lift it high\nLet the music reach the sky"
    }
  ]

  const listSongs = playlist.songs.length > 0 ? playlist.songs : mockSongs
  const songsCountLabel =
    listSongs.length === 1 ? t.playlistDetail.song : t.playlistDetail.songsPlural
  const mockLyrics = [
    "Verse 1\nLight in the morning, calm in the night\nWe carry the melody, keep it in sight\n\nChorus\nSing it out, sing it true\nEvery line a pathway through",
    "Verse 1\nQuiet streets and open skies\nWe find the rhythm, we let it rise\n\nChorus\nHold the note, let it glow\nEvery song tells us where to go",
    "Verse 1\nHands on strings and hearts aligned\nWe follow the tempo, leave fear behind\n\nChorus\nLift it up, lift it high\nLet the music reach the sky"
  ]

  useEffect(() => {
    if (!playlist.shareCode) return
    setShareUrl(`${window.location.origin}${playlistPath}`)
  }, [playlist.shareCode, playlistPath])

  useEffect(() => {
    if (activeIndex === null) return

    bodyOverflowRef.current = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      document.body.style.overflow = bodyOverflowRef.current
    }
  }, [activeIndex])

  const activeSong = activeIndex !== null ? listSongs[activeIndex] : null
  const totalSongs = listSongs.length

  const handleCloseDrawer = () => setActiveIndex(null)
  const handlePrevSong = () => {
    if (activeIndex === null || activeIndex === 0) return
    setActiveIndex(activeIndex - 1)
  }
  const handleNextSong = () => {
    if (activeIndex === null || activeIndex >= totalSongs - 1) return
    setActiveIndex(activeIndex + 1)
  }

  const getLyrics = (index: number) => {
    const fallback = mockLyrics[index % mockLyrics.length]
    const lyrics = listSongs[index]?.lyrics
    return lyrics && lyrics.trim().length > 0 ? lyrics : fallback
  }

  const copyToClipboard = async () => {
    if (!shareUrl) return

    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success(t.playlistDetail.copied)
    } catch {
      toast.error(t.common.copyToClipboardFailed)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold">Capo</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 pb-16 pt-8">
        <div className="space-y-6">
          <Card className="border bg-card">
            <CardContent className="space-y-4 p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      <Globe className="mr-1 h-3 w-3" />
                      {t.filters.public}
                    </Badge>
                    {playlist.allowGuestEditing && (
                      <Badge variant="outline" className="text-xs">
                        {t.playlistShare.guestEditing}
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                    <Link
                      href={playlistPath}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-primary"
                    >
                      {playlist.name}
                    </Link>
                  </h1>
                  {playlist.description && (
                    <p className="max-w-2xl text-sm text-muted-foreground">
                      {playlist.description}
                    </p>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={copyToClipboard}
                  aria-label={t.playlistShare.share}
                  disabled={!shareUrl}
                >
                  <Share2 className="h-4 w-4" />
                  {t.playlistShare.share}
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <ListMusic className="h-3.5 w-3.5" />
                  <span className="text-sm font-medium">{listSongs.length}</span>
                  <span className="text-xs text-muted-foreground">{songsCountLabel}</span>
                </div>
                {playlist.date && (
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-3.5 w-3.5" />
                    <span className="text-xs text-muted-foreground">
                      {formatLongDate(playlist.date, locale)}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border bg-card">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{t.playlistDetail.songs}</span>
                <span>
                  {listSongs.length} {songsCountLabel}
                </span>
              </div>

              <div className="divide-y">
                {listSongs.map((song, index) => (
                  <button
                    key={song.id}
                    type="button"
                    className="flex w-full items-start gap-4 py-4 text-left transition hover:bg-muted/40"
                    onClick={() => setActiveIndex(index)}
                    aria-label={`${song.title} ${song.artist}`}
                  >
                    <div className="text-xs text-muted-foreground tabular-nums">{index + 1}</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate text-base font-medium">{song.title}</h3>
                          <p className="text-sm text-muted-foreground">{song.artist}</p>
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {song.key && <Badge variant="outline">{song.key}</Badge>}
                        {song.bpm > 0 && (
                          <Badge variant="outline" className="flex items-center">
                            <Clock3 className="mr-1 h-3 w-3" />
                            {song.bpm} BPM
                          </Badge>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {playlist.allowGuestEditing && (
            <div className="flex items-center justify-between rounded-md border px-4 py-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CirclePlus className="h-4 w-4" />
                {t.playlistShare.editSongs}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => toast(t.playlistShare.editSongsHint)}
              >
                {t.playlistShare.editSongs}
              </Button>
            </div>
          )}
        </div>
      </main>

      <Drawer
        open={activeIndex !== null}
        onOpenChange={(open) => !open && handleCloseDrawer()}
        direction="top"
      >
        <DrawerContent
          className="inset-0 h-full p-0 data-[vaul-drawer-direction=top]:max-h-full data-[vaul-drawer-direction=top]:rounded-none"
        >
          <div className="relative flex h-full flex-col">
            <DrawerHeader className="sr-only">
              <DrawerTitle>{activeSong ? `${activeSong.title} lyrics` : "Song lyrics"}</DrawerTitle>
            </DrawerHeader>
            <div className="pointer-events-none absolute right-4 bottom-4 z-20 flex items-center gap-2">
              <div className="pointer-events-auto flex items-center gap-2 rounded-full border bg-background/90 px-2 py-1 shadow-sm">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={handlePrevSong}
                  disabled={activeIndex === null || activeIndex === 0}
                  aria-label="Previous song"
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={handleNextSong}
                  disabled={activeIndex === null || activeIndex >= totalSongs - 1}
                  aria-label="Next song"
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {activeSong && (
                <LyricsView
                  mode="panel"
                  readOnly
                  onClose={handleCloseDrawer}
                  song={{
                    ...activeSong,
                    lyrics: activeIndex !== null ? getLyrics(activeIndex) : activeSong.lyrics,
                    fontSize: activeSong.fontSize ?? 1,
                    transpose: activeSong.transpose ?? 0,
                    capo: activeSong.capo ?? 0
                  }}
                />
              )}
            </div>

          </div>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
