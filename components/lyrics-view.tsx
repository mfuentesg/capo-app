"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Music2, Type, Plus, Minus, Guitar, Settings2 } from "lucide-react"
import { useRouter } from "next/navigation"
import type { Song } from "@/types"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { useLyricsSettings } from "@/hooks/use-lyrics-settings"
import { RenderedSong } from "@/components/rendered-song"
import { useTranslation } from "@/hooks/use-translation"

interface LyricsViewProps {
  song: Song
}

export function LyricsView({ song }: LyricsViewProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const { font, transpose, capo } = useLyricsSettings({
    initialFontSize: song.fontSize,
    initialTranspose: song.transpose,
    initialCapo: song.capo
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="shrink-0"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-semibold truncate">{song.title}</h1>
                <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="shrink-0">
                {song.key}
              </Badge>
              <Badge variant="outline" className="shrink-0">
                {song.bpm} {t.songs.bpm}
              </Badge>
            </div>
          </div>

          {/* Controls */}
          <div className="mt-4 pt-4 border-t flex items-center justify-end gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings2 className="h-4 w-4 mr-2" />
                  {t.songs.lyrics.settings}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto mr-2.5" align="start">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">{t.songs.lyrics.displaySettings}</h4>
                    <p className="text-sm text-muted-foreground">
                      {t.songs.lyrics.displaySettingsDescription}
                    </p>
                  </div>

                  <Separator />

                  {/* Font Size */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Type className="h-4 w-4" />
                      <span className="text-sm font-medium">{t.songs.lyrics.fontSize}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={font.decrease}
                        variant="outline"
                        size="sm"
                        disabled={font.isAtMin()}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-md min-w-20 justify-center">
                        <Type className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm font-medium">{font.value.toFixed(2)}</span>
                      </div>
                      <Button
                        onClick={font.increase}
                        variant="outline"
                        size="sm"
                        disabled={font.isAtMax()}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={font.reset}
                        disabled={font.isAtDefault()}
                        className="text-xs"
                      >
                        {t.songs.reset}
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  {/* Transpose */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Music2 className="h-4 w-4" />
                      <span className="text-sm font-medium">{t.songs.transpose}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={transpose.decrease}
                        variant="outline"
                        size="sm"
                        disabled={transpose.isAtMin()}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-md min-w-20 justify-center">
                        <Music2 className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm font-medium">{transpose.display()}</span>
                        <span className="text-xs text-muted-foreground">st</span>
                      </div>
                      <Button
                        onClick={transpose.increase}
                        variant="outline"
                        size="sm"
                        disabled={transpose.isAtMax()}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={transpose.reset}
                        disabled={transpose.isAtDefault()}
                        className="text-xs"
                      >
                        {t.songs.reset}
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  {/* Capo */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Guitar className="h-4 w-4" />
                      <span className="text-sm font-medium">{t.songs.capo}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={capo.decrease}
                        variant="outline"
                        size="sm"
                        disabled={capo.isAtMin()}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-md min-w-20 justify-center">
                        <Guitar className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm font-medium">{capo.display()}</span>
                      </div>
                      <Button
                        onClick={capo.increase}
                        variant="outline"
                        size="sm"
                        disabled={capo.isAtMax()}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={capo.reset}
                        disabled={capo.isAtDefault()}
                        className="text-xs"
                      >
                        {t.songs.reset}
                      </Button>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* Lyrics Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="w-full">
          <RenderedSong
            lyrics={song.lyrics}
            transpose={transpose.value}
            capo={capo.value}
            fontSize={font.value}
          />
        </div>
      </div>
    </div>
  )
}
