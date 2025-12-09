import type { Song } from '../types'

export const mockSong: Song = {
  id: '1',
  title: 'Test Song',
  artist: 'Test Artist',
  key: 'C',
  bpm: 120,
  isDraft: false
}

export const mockSongs: Song[] = [
  mockSong,
  {
    id: '2',
    title: 'Another Song',
    artist: 'Another Artist',
    key: 'G',
    bpm: 100,
    isDraft: false
  }
]
