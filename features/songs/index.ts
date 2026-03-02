export * from "./components"

export { NewSongsProvider, useNewSongs } from "./contexts"
export type { NewSongsContextType } from "./contexts"

export { useSongs, useUpdateSong } from "./hooks/use-songs"
export {
  useUserSongSettings,
  useUpsertUserSongSettings,
  useEffectiveSongSettings,
  useAllUserSongSettings
} from "./hooks/use-user-song-settings"
export { useUserPreferences, useUpsertUserPreferences } from "./hooks/use-user-preferences"
export { songsKeys } from "./hooks/query-keys"

export { api } from "./api"

export type {
  Song,
  UserSongSettings,
  UserPreferences,
  GroupBy,
  SongDetailProps,
  SongListProps,
  SongFilterStatus,
  BPMRange,
  MusicalKey
} from "./types"
