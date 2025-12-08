"use client"

import { useMemo } from "react"
import { Calendar as CalendarIcon, ListMusic, ArrowLeft, Copy } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import Link from "next/link"
import type { Playlist } from "@/types"
import type { SongWithPosition } from "@/types/extended"
import { getSongsByIds } from "@/lib/songs-data"

interface PlaylistShareViewProps {
  playlist: Playlist
}

export function PlaylistShareView({ playlist }: PlaylistShareViewProps) {
  // Convert playlist songs to SongWithPosition format
  const songsWithPosition = useMemo<SongWithPosition[]>(() => {
    const songs = getSongsByIds(playlist.songs)
    return songs.map((song, index) => ({
      ...song,
      position: index
    }))
  }, [playlist.songs])

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/dashboard/playlists/${playlist.shareCode}`
      : ""

  const copyToClipboard = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl)
      toast.success("Link copied to clipboard!")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto p-4 lg:p-8">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2 mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
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
                  Copy
                </Button>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {playlist.date && (
                <Badge variant="outline" className="gap-1.5">
                  <CalendarIcon className="h-3.5 w-3.5" />
                  {format(new Date(playlist.date), "PPP")}
                </Badge>
              )}
              <Badge variant="secondary" className="gap-1.5">
                <ListMusic className="h-3.5 w-3.5" />
                {playlist.songs.length} {playlist.songs.length === 1 ? "song" : "songs"}
              </Badge>
              <Badge variant="secondary">Public Playlist</Badge>
            </div>
          </div>

          {/* Songs List */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Songs</h2>
            {songsWithPosition.length === 0 ? (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <ListMusic />
                  </EmptyMedia>
                  <EmptyTitle>No songs in this playlist</EmptyTitle>
                  <EmptyDescription>This playlist is currently empty</EmptyDescription>
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
            <p>Powered by Capo</p>
          </div>
        </div>
      </div>
    </div>
  )
}
