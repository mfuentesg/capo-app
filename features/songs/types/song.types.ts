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

export interface UserSongSettings {
  songId: string
  capo: number
  transpose: number
  fontSize?: number
}

export interface UserPreferences {
  minimalistLyricsView: boolean
}

export type GroupBy = "none" | "key" | "artist"

export interface SongDetailProps {
  song: Song
  onClose: () => void
  onUpdate: (songId: string, updates: Partial<Song>) => void
  onDelete: (songId: string) => void
}

export type SongFilterStatus = "all" | "drafts" | "completed"

export type BPMRange = "all" | "slow" | "medium" | "fast"

export interface SongListProps {
  songs: Song[]
  previewSong?: Song | null
  selectedSong?: Song | null
  searchQuery: string
  groupBy: GroupBy
  filterStatus: SongFilterStatus
  bpmRange: BPMRange
  isCreatingNewSong?: boolean
  onSelectSong: (song: Song) => void
}

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
