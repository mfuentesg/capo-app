import { LyricsView } from "@/features/lyrics-editor"
import type { Song } from "@/types"

// Mock data - in real app, fetch from database
const mockSong: Song = {
  id: "550e8400-e29b-41d4-a716-446655440001",
  title: "Dios Poderoso",
  artist: "Generación 12",
  key: "Gm",
  bpm: 72,
  lyrics: `{start_of_verse: Verso 1}
[Gm]¿Quién sino el Señor las estrellas [A#]creó y su luz limitó?
[Gm]¿Quién sino el Señor, sol y luna [A#]formó movimiento les dio?
[F]¿Quién sino el Señor, hace la [Cm]lluvia venir truenos rugir?
[F]Tus obras grandes [Cm]son
{end_of_verse}

{start_of_chorus: Coro}
Dios Poderoso Tú, gobiernas la creación
Con Tu Palabra Señor, Te exaltaremos

Dios Poderoso, De Ti canta la creación
Llenas todo Tú, Señor Te exaltaremos
Por siempre y siempre, oh Dios
{end_of_chorus}

{start_of_verse: Verso 2}
¿Quién sino el Señor ha soñado en el plan para al hombre salvar?
¿Quién sino el Señor limpiará al pecador con Su sangre y amor?
¿Quién sino el Señor puede dar vida y salvar por una cruz?
Tus planes grandes son
{end_of_verse}

{start_of_bridge: Puente}
Todas las cosas, vienen de Ti y por Ti
Oh gran Yo Soy
Todo es Tuyo, y para Ti, oh Señor
Oh gran Yo Soy
{end_of_bridge}`,
  notes: "Medium tempo, builds well",
  tags: ["worship", "praise"]
}

export default async function SongLyricsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  // In a real app, you would fetch the song from the database
  // For now, we just use the mock song for any ID
  console.log("Song ID:", id)
  return <LyricsView song={mockSong} />
}
