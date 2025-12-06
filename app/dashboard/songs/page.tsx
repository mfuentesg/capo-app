import { SongsClient } from "@/components/songs-client"
import type { Song } from "@/types"

const mockSongs: Song[] = [
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
  }
]

export default function SongsPage() {
  return <SongsClient initialSongs={mockSongs} />
}
