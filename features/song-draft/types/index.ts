export interface DraftSong {
  id: string
  title: string
  artist: string
  key: string
  bpm: number
  lyrics?: string
  isDraft: true
}
