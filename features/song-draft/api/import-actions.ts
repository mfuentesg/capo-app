"use server"

import type { DraftSong } from "../types"
import { detectPlatform } from "../utils/import/platform-detector"
import { importFromCifraClub } from "../utils/import/cifraclub-importer"
import { importFromUltimateGuitar } from "../utils/import/ultimate-guitar-importer"

export async function importSongFromUrl(url: string): Promise<DraftSong> {
  let parsedUrl: URL
  try {
    parsedUrl = new URL(url)
  } catch {
    throw new Error("Invalid URL")
  }

  const platform = detectPlatform(parsedUrl)

  switch (platform) {
    case "cifraclub":
      return importFromCifraClub(parsedUrl)
    case "ultimate-guitar":
      return importFromUltimateGuitar(parsedUrl)
    default:
      throw new Error(`Unsupported platform: ${parsedUrl.hostname}`)
  }
}
