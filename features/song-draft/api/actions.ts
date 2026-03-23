"use server"

import { detectPlatform } from "../utils/import/platform-detector"
import { importFromCifraClub } from "../utils/import/cifraclub-importer"
import { importFromUltimateGuitar } from "../utils/import/ultimate-guitar-importer"
import { importFromLaCuerda } from "../utils/import/lacuerda-importer"
import { searchCifraClub } from "../utils/import/search"
import type { ImportedSong } from "../utils/import/types"

export async function searchSongChords(title: string, artist: string): Promise<ImportedSong> {
  const url = await searchCifraClub(title, artist)
  return importFromCifraClub(url)
}

export async function importSongFromUrl(url: string): Promise<ImportedSong> {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    throw new Error("invalidUrl")
  }

  const platform = detectPlatform(parsed)
  if (platform === "cifraclub") return importFromCifraClub(parsed)
  if (platform === "ultimate-guitar") return importFromUltimateGuitar(parsed)
  if (platform === "lacuerda") return importFromLaCuerda(parsed)

  throw new Error("unsupportedPlatform")
}
