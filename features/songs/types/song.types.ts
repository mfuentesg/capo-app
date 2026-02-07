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
  isDraft?: boolean
}

export type GroupBy = "none" | "key" | "artist"

export interface SongDetailProps {
  song: Song
  onClose: () => void
  onUpdate: (songId: string, updates: Partial<Song>) => void
  onDelete: (songId: string) => void
}

export interface SongListProps {
  songs: Song[]
  previewSong?: Song | null
  selectedSong?: Song | null
  searchQuery: string
  groupBy: GroupBy
  isCreatingNewSong?: boolean
  onSelectSong: (song: Song) => void
}

export interface SongsClientProps {
  initialSongs: Song[]
}

export type BPMRange = "all" | "slow" | "medium" | "fast"

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
