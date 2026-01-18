export { SongsClient } from "./components/songs-client"
export { SongDetail } from "./components/song-detail"
export { SongList } from "./components/song-list"
export { SongItem } from "./components/song-item"
export { KeySelect } from "./components/key-select"

export { NewSongsProvider, useNewSongs } from "./contexts"
export type { NewSongsContextType } from "./contexts"

export { useSongs } from "./hooks/use-songs"

export { getSongs } from "./api"

// Re-export mock data from centralized location
export { mockSongs, getSongById, getSongsByIds, getAllSongs } from "@/lib/mock-data"

export type {
  Song,
  GroupBy,
  SongDetailProps,
  SongListProps,
  SongsClientProps,
  BPMRange,
  MusicalKey
} from "./types"
