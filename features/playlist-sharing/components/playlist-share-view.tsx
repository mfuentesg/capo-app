"use client"

import Link from "next/link"
import { Globe, Share2, Clock3, GripVertical, CirclePlus } from "lucide-react"
import { toast } from "sonner"
import { useLocale } from "@/features/settings"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import type { PlaylistWithSongs } from "@/features/playlists/types"

interface PlaylistShareViewProps {
  playlist: PlaylistWithSongs
}

export function PlaylistShareView({ playlist }: PlaylistShareViewProps) {
  const { t } = useLocale()
  const playlistPath = playlist.shareCode ? `/playlists/${playlist.shareCode}` : "/playlists"

  const shareUrl =
    typeof window !== "undefined" && playlist.shareCode
      ? `${window.location.origin}${playlistPath}`
      : ""

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

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-2 rounded-md bg-card p-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
              <h1 className="text-lg font-semibold">
                <Link href={playlistPath} target="_blank" className="hover:underline">
                  {playlist.name}
                </Link>
              </h1>
              <div className="flex items-center justify-center gap-2">
                <Badge className="border-green-200 bg-green-50 text-green-700">
                  <Globe className="mr-1 h-3 w-3" />
                  {t.filters.public}
                </Badge>
                {playlist.allowGuestEditing && (
                  <Badge className="border-blue-200 bg-blue-50 text-blue-700">
                    {t.playlistShare.guestEditing}
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                aria-label={t.playlistShare.share}
                disabled={!shareUrl}
              >
                <Share2 className="h-4 w-4" />
                <span className="sr-only">{t.playlistShare.share}</span>
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            {playlist.songs.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                {t.playlistShare.emptyDescription}
              </div>
            ) : (
              <div className="space-y-2">
                {playlist.songs.map((song) => (
                  <div key={song.id} className="relative">
                    <Card className="w-full border-2 p-4 py-2">
                      <CardContent className="relative flex items-center justify-between px-0">
                        <div className="flex flex-col gap-3">
                          <div>
                            <h3 className="font-medium">{song.title}</h3>
                            <p className="text-sm text-muted-foreground">{song.artist}</p>
                          </div>
                          <div className="flex items-start gap-2">
                            {song.key && <Badge variant="outline">{song.key}</Badge>}
                            {song.bpm > 0 && (
                              <Badge className="flex items-center border-purple-200 bg-purple-50 text-purple-700">
                                <Clock3 className="mr-1 h-3 w-3" />
                                {song.bpm} BPM
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <GripVertical className="absolute top-10 right-5 text-muted-foreground" />
                  </div>
                ))}
              </div>
            )}

            {playlist.allowGuestEditing && (
              <Button
                type="button"
                variant="ghost"
                className="w-full cursor-pointer justify-center"
                onClick={() => toast(t.playlistShare.editSongsHint)}
              >
                <CirclePlus />
                {t.playlistShare.editSongs}
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
