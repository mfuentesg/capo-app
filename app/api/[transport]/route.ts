import { createMcpHandler } from "mcp-handler"
import { z } from "zod"
import { detectPlatform } from "@/features/song-draft/utils/import/platform-detector"
import { importFromCifraClub } from "@/features/song-draft/utils/import/cifraclub-importer"
import { importFromUltimateGuitar } from "@/features/song-draft/utils/import/ultimate-guitar-importer"
import { importFromLaCuerda } from "@/features/song-draft/utils/import/lacuerda-importer"

const handler = createMcpHandler(
  (server) => {
    server.registerTool(
      "get_song_chords",
      {
        title: "Get Song Chords",
        description:
          "Fetch chord sheet for a song from a CifraClub, LaCuerda, or Ultimate Guitar URL. " +
          "Returns the title, artist, and lyrics formatted in ChordPro notation (chords inline as [A], [G7], etc.).",
        inputSchema: {
          url: z
            .string()
            .url()
            .describe(
              "A song page URL from cifraclub.com.br, lacuerda.net, or ultimate-guitar.com"
            ),
        },
      },
      async ({ url }) => {
        let parsed: URL
        try {
          parsed = new URL(url)
        } catch {
          return {
            isError: true,
            content: [{ type: "text" as const, text: "Invalid URL provided." }],
          }
        }

        const platform = detectPlatform(parsed)

        try {
          let song
          if (platform === "cifraclub") {
            song = await importFromCifraClub(parsed)
          } else if (platform === "ultimate-guitar") {
            song = await importFromUltimateGuitar(parsed)
          } else if (platform === "lacuerda") {
            song = await importFromLaCuerda(parsed)
          } else {
            return {
              isError: true,
              content: [
                {
                  type: "text" as const,
                  text: `Unsupported platform: ${parsed.hostname}. Supported: cifraclub.com.br, lacuerda.net, ultimate-guitar.com`,
                },
              ],
            }
          }

          const lines: string[] = [
            `Title: ${song.title}`,
            `Artist: ${song.artist}`,
          ]
          if (song.key) lines.push(`Key: ${song.key}`)
          if (song.bpm) lines.push(`BPM: ${song.bpm}`)
          lines.push("", song.lyrics)

          return {
            content: [{ type: "text" as const, text: lines.join("\n") }],
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : "Unknown error"
          return {
            isError: true,
            content: [{ type: "text" as const, text: `Failed to fetch song: ${message}` }],
          }
        }
      }
    )
  },
  {},
  { basePath: "/api", maxDuration: 60 }
)

export { handler as GET, handler as POST }
