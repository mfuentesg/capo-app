import { SongsClient } from "@/features/songs"
import { mockSongs } from "@/lib/songs-data"

// TODO: Replace with backend API call to fetch songs
// Example: const songs = await fetch('/api/songs').then(r => r.json())

export default function SongsPage() {
  return <SongsClient initialSongs={mockSongs} />
}
