import type { Playlist } from '../types'

export const mockPlaylist: Playlist = {
  id: '1',
  name: 'Test Playlist',
  description: 'A test playlist',
  date: '2024-01-01',
  songs: ['1', '2', '3'],
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
  isDraft: false,
  visibility: 'private'
}

export const mockPlaylists: Playlist[] = [
  mockPlaylist,
  {
    id: '2',
    name: 'Another Playlist',
    songs: ['4', '5'],
    createdAt: '2024-01-02',
    updatedAt: '2024-01-02',
    isDraft: false,
    visibility: 'private'
  }
]
