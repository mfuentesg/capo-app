import type { Song } from "@/types"

// Mock songs data - this will be replaced with Supabase queries
export const mockSongs: Song[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    title: "Dios Poderoso",
    artist: "Generación 12",
    key: "Gm",
    bpm: 72,
    notes: "Great for opening worship",
    tags: ["worship", "opening"]
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    title: "Ven ante su trono",
    artist: "Elevation Worship",
    key: "D#",
    bpm: 120,
    notes: "Medium tempo, builds well",
    tags: ["worship", "praise"]
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    title: "Al Que Está Sentado en el Trono",
    artist: "Marcos Brunet",
    key: "A",
    bpm: 141,
    tags: ["fast", "celebration"]
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440004",
    title: "Santo por siempre",
    artist: "La IBI",
    key: "G",
    bpm: 140,
    notes: "Congregation favorite",
    tags: ["worship", "holiness"]
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440005",
    title: "Mi esperanza esta en Jesus",
    artist: "Bethel Music",
    key: "A",
    bpm: 144,
    tags: ["hope", "declaration"]
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440006",
    title: "Serviremos al señor",
    artist: "Para su gloria",
    key: "D",
    bpm: 96,
    notes: "Good for closing",
    tags: ["commitment", "closing"]
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440007",
    title: "Grande y Fuerte",
    artist: "Miel San Marcos",
    key: "Am",
    bpm: 150,
    tags: ["power", "declaration"]
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440008",
    title: "Dios Poderoso",
    artist: "La IBI",
    key: "A#",
    bpm: 116,
    tags: ["worship", "adoration"]
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440009",
    title: "Tu Gracia Me Basta",
    artist: "Christine D'Clario",
    key: "C",
    bpm: 68,
    notes: "Work in progress - need to add chords",
    tags: ["grace", "ballad"],
    isDraft: true
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440010",
    title: "Rompiste Mi Corazón",
    artist: "Maverick City Música",
    key: "Em",
    bpm: 80,
    notes: "Incomplete - missing tempo and arrangement notes",
    tags: ["intimate", "worship"],
    isDraft: true
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440011",
    title: "Nada Me Faltará",
    artist: "Alex Campos",
    key: "F",
    bpm: 76,
    tags: ["trust", "provision"],
    isDraft: true
  }
]

/**
 * Get a song by ID
 * TODO: Replace with backend API call or database query
 */
export function getSongById(songId: string): Song | undefined {
  return mockSongs.find((song) => song.id === songId)
}

/**
 * Get multiple songs by their IDs
 * TODO: Replace with backend API call or database query
 */
export function getSongsByIds(songIds: string[]): Song[] {
  return songIds
    .map((id) => mockSongs.find((song) => song.id === id))
    .filter((song): song is Song => song !== undefined)
}

/**
 * Get all songs
 * TODO: Replace with backend API call or database query
 */
export function getAllSongs(): Song[] {
  return mockSongs
}
