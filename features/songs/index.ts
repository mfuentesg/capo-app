"use client"

// Components - Main Exports
export { SongsClient } from "./components/songs-client"
export { SongDetail } from "./components/song-detail"
export { SongList } from "./components/song-list"
export { SongItem } from "./components/song-item"
export { KeySelect } from "./components/key-select"

// Contexts
export { NewSongsProvider, useNewSongs } from "./contexts"
export type { NewSongsContextType } from "./contexts"

// Hooks
export { useSongs } from "./hooks/use-songs"

// Types
export type {
  Song,
  GroupBy,
  SongDetailProps,
  SongListProps,
  SongsClientProps,
  BPMRange,
  MusicalKey
} from "./types"
