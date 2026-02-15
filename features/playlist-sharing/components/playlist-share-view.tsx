"use client"

import { useMemo } from "react"
import { Calendar as CalendarIcon, ListMusic, ArrowLeft, Copy } from "lucide-react"
import { toast } from "sonner"
import { useLocale } from "@/features/settings"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import Link from "next/link"
import type { PlaylistWithSongs } from "@/features/playlists/types"
import { formatLongDate } from "@/lib/utils"

interface PlaylistShareViewProps {
  playlist: PlaylistWithSongs
}

export function PlaylistShareView({ playlist }: PlaylistShareViewProps) {
  const songsWithPosition = useMemo(
    () =>
      playlist.songs.map((song, position) => ({
        ...song,
        position
      })),
    [playlist.songs]
  )

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/playlists/${playlist.shareCode}`
      : ""

  const { t, locale } = useLocale()

  const copyToClipboard = async () => {
    if (shareUrl) {
      try {
        await navigator.clipboard.writeText(shareUrl)
        toast.success(t.playlistDetail.copied)
      } catch {
        toast.error(t.common.copyToClipboardFailed)
      }
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto p-4 lg:p-8">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2 mb-6">
            <ArrowLeft className="h-4 w-4" />
            {t.common.backToHome}
          </Button>
        </Link>

        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tight">{playlist.name}</h1>

            {/* Share URL */}
            {playlist.shareCode && (
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <code className="flex-1 text-sm font-mono truncate">{shareUrl}</code>
                <Button size="sm" variant="outline" onClick={copyToClipboard} className="gap-1.5">
                  <Copy className="h-3 w-3" />
                  {t.playlistDetail.copy}
                </Button>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {playlist.date && (
                <Badge variant="outline" className="gap-1.5">
                  <CalendarIcon className="h-3.5 w-3.5" />
                  {formatLongDate(new Date(playlist.date), locale)}
                </Badge>
              )}
              <Badge variant="secondary" className="gap-1.5">
                <ListMusic className="h-3.5 w-3.5" />
                {playlist.songs.length}{" "}
                {playlist.songs.length === 1 ? t.playlistDetail.song : t.playlistDetail.songsPlural}
              </Badge>
              <Badge variant="secondary">{t.playlistShare.publicPlaylist}</Badge>
            </div>
          </div>

          {/* Songs List */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">{t.playlistDetail.songs}</h2>
            {songsWithPosition.length === 0 ? (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <ListMusic />
                  </EmptyMedia>
                  <EmptyTitle>{t.playlistDetail.noSongsInPlaylist}</EmptyTitle>
                  <EmptyDescription>{t.playlistShare.emptyDescription}</EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <div className="space-y-2">
                {songsWithPosition.map((song) => (
                  <div
                    key={song.id}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <span className="text-sm font-medium text-muted-foreground w-8">
                      {song.position + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{song.title}</h3>
                      <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="font-mono text-xs">
                        {song.key}
                      </Badge>
                      {song.bpm && (
                        <Badge variant="outline" className="text-xs">
                          {song.bpm} BPM
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="pt-8 border-t text-center text-sm text-muted-foreground">
            <p>{t.common.poweredBy}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
