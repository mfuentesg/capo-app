import type { Song, Playlist } from "./index"

export interface SongWithPosition extends Song {
  position: number
}

export interface PlaylistWithSongs extends Omit<Playlist, "songs"> {
  songs: SongWithPosition[]
}
