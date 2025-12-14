"use client"

import { useMemo } from "react"
import { ChordProParser, TextFormatter } from "chordsheetjs"
import { Music2 } from "lucide-react"
import { useLocale } from "@/contexts/locale-context"

interface RenderedSongProps {
  lyrics?: string
  transpose: number
  capo: number
  fontSize: number
}

export function RenderedSong({ lyrics, transpose, capo, fontSize }: RenderedSongProps) {
  const renderedSong = useMemo(() => {
    if (!lyrics) return null

    try {
      const parser = new ChordProParser()
      const formatter = new TextFormatter()

      let parsedSong = parser.parse(lyrics)

      // Apply transpose - transposeUp/transposeDown take the number of steps
      if (transpose > 0) {
        for (let i = 0; i < transpose; i++) {
          parsedSong = parsedSong.transposeUp()
        }
      } else if (transpose < 0) {
        for (let i = 0; i < Math.abs(transpose); i++) {
          parsedSong = parsedSong.transposeDown()
        }
      }

      // Apply capo - transpose DOWN by capo amount (capo raises pitch, so you play lower chords)
      if (capo > 0) {
        for (let i = 0; i < capo; i++) {
          parsedSong = parsedSong.transposeDown()
        }
      }

      const formattedText = formatter.format(parsedSong)

      // Convert text format to HTML with styled chords
      return formattedText
        .split("\n")
        .map((line) => {
          // Check if line contains chords (uppercase letters with optional modifiers)
          const hasChords =
            /\b[A-G][#b]?(?:m|maj|min|sus|dim|aug|add)?[0-9]?(?:\/[A-G][#b]?)?\b/.test(line)

          if (hasChords && !line.trim().startsWith("{")) {
            // Replace chord patterns with styled spans
            const styledLine = line.replace(
              /\b([A-G][#b]?(?:m|maj|min|sus|dim|aug|add)?[0-9]?(?:\/[A-G][#b]?)?)\b/g,
              '<span class="chord">$1</span>'
            )
            return styledLine
          }

          return line
        })
        .join("\n")
    } catch (error) {
      console.error("Error parsing ChordPro:", error)
      return null
    }
  }, [lyrics, transpose, capo])

  const { t } = useLocale()

  if (!lyrics) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
          <Music2 className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-lg font-medium">{t.songs.noLyrics}</p>
        <p className="text-sm text-muted-foreground mt-2">{t.songs.addLyricsDescription}</p>
      </div>
    )
  }

  if (renderedSong) {
    return (
      <pre
        className="chordsheet-content multi-column-lyrics"
        style={{ fontSize: `${fontSize}rem`, fontWeight: 600 }}
        dangerouslySetInnerHTML={{ __html: renderedSong }}
      />
    )
  }

  return (
    <div
      className="whitespace-pre-wrap leading-relaxed multi-column-lyrics"
      style={{ fontSize: `${fontSize}rem`, lineHeight: 1.8, fontWeight: 600 }}
    >
      {lyrics}
    </div>
  )
}
