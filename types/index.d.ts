export interface Song {
  id: string
  title: string
  artist: string
  key: string
  bpm: number
  lyrics?: string
  notes?: string
  tags?: string[]
  fontSize?: number
  transpose?: number
  capo?: number
}

export interface Playlist {
  id: string
  name: string
  description?: string
  date?: string
  songs: Song[]
  createdAt: string
  updatedAt: string
}

export type GroupBy = "none" | "key" | "artist"

export type MusicalKey =
  | "A"
  | "Am"
  | "A#"
  | "A#m"
  | "Bb"
  | "Bbm"
  | "B"
  | "Bm"
  | "C"
  | "Cbm"
  | "Cb"
  | "Cm"
  | "C#"
  | "C#m"
  | "Db"
  | "Dbm"
  | "D"
  | "Dm"
  | "D#"
  | "D#m"
  | "E"
  | "Em"
  | "Eb"
  | "Ebm"
  | "F"
  | "Fb"
  | "Fbm"
  | "Fm"
  | "F#"
  | "F#m"
  | "G"
  | "Gm"
  | "G#"
  | "G#m"
  | "Gb"
  | "Gbm"
  | "Ab"
  | "Abm"
