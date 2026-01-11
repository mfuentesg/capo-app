/**
 * Centralized Mock Data
 *
 * This file contains all mock/demo data used for development and testing.
 * Once the API is fully connected to Supabase, this entire file can be deleted.
 *
 * TODO: Remove this file when backend API is implemented
 */

import { faker } from "@faker-js/faker"
import type { Song, Playlist } from "@/types"
import type { Tables } from "@/lib/supabase/database.types"
import type { Activity } from "@/features/activity/api/activityApi"

// ============================================================================
// Constants for Mock Data Generation
// ============================================================================

const MUSICAL_KEYS = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
  "Cm",
  "C#m",
  "Dm",
  "D#m",
  "Em",
  "Fm",
  "F#m",
  "Gm",
  "G#m",
  "Am",
  "A#m",
  "Bm"
]

const WORSHIP_SONGS = [
  "Dios Poderoso",
  "Ven ante su trono",
  "Al Que Esta Sentado en el Trono",
  "Santo por siempre",
  "Espiritu y verdad",
  "Gracia amazingrace",
  "Mas que vencedor",
  "En tu trono me siento",
  "Glorioso Rei",
  "Consagracion",
  "Himno de fe"
]

const WORSHIP_ARTISTS = [
  "Generación 12",
  "Elevation Worship",
  "Marcos Brunet",
  "La IBI",
  "Jesus Culture",
  "John Newton",
  "Redención",
  "Bethel Music",
  "Thalles Roberto",
  "Marcos Witt",
  "Paulo Cesar",
  "Hillsong UNITED",
  "Casting Crowns",
  "Skillet",
  "Newsboys"
]

const SONG_TAGS = [
  "worship",
  "opening",
  "closing",
  "contemporary",
  "traditional",
  "energetic",
  "calm",
  "prophetic"
]

// ============================================================================
// Helper Functions for Mock Data Generation
// ============================================================================

function generateSongId(): string {
  const base = "550e8400-e29b-41d4-a716-"
  const suffix = faker.number.int({ min: 100000000000, max: 999999999999 })
  return base + suffix.toString().padStart(12, "0")
}

function generateMockSong(_?: unknown, index?: number): Song {
  const songTitle = faker.helpers.arrayElement(WORSHIP_SONGS)
  const artist = faker.helpers.arrayElement(WORSHIP_ARTISTS)
  const bpm = faker.number.int({ min: 60, max: 140 })
  const key = faker.helpers.arrayElement(MUSICAL_KEYS)
  const tags = faker.helpers.arrayElements(SONG_TAGS, { min: 1, max: 3 })

  return {
    id: generateSongId(),
    title: `${songTitle} ${index ? `(Variation ${index})` : ""}`.trim(),
    artist,
    key,
    bpm,
    notes: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.3 }),
    tags,
    isDraft: false
  }
}

function generateMockPlaylist(): Playlist {
  const songCount = faker.number.int({ min: 2, max: 6 })
  const songs = Array.from(
    { length: songCount },
    () => mockSongs[faker.number.int({ min: 0, max: mockSongs.length - 1 })].id
  )

  const date = faker.date.future()

  return {
    id: faker.string.uuid(),
    name: faker.lorem.words({ min: 2, max: 4 }),
    description: faker.lorem.sentence(),
    date: date.toISOString().split("T")[0],
    songs,
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.recent().toISOString(),
    visibility: faker.helpers.arrayElement(["public", "private"]),
    allowGuestEditing: faker.datatype.boolean(),
    shareCode: faker.string.alphanumeric(6).toUpperCase(),
    isDraft: faker.helpers.maybe(() => true, { probability: 0.2 }) ?? false
  }
}

function generateMockTeam(): Tables<"teams"> {
  const teamName = faker.company.name()


  return {
    id: faker.string.uuid(),
    name: teamName,
    description: faker.lorem.sentence(),

    avatar_url: null,
    icon: faker.helpers.arrayElement(["Music", "Users", "Star", "Heart", "Trophy", "Rocket", "Guitar", "Mic2"]),
    is_public: faker.helpers.maybe(() => true, { probability: 0.3 }) ?? false,
    created_by: faker.string.uuid(),
    created_at: faker.date.past().toISOString(),
    updated_at: faker.date.recent().toISOString()
  }
}

// ============================================================================
// Mock Songs
// ============================================================================

// Real worship songs as base data
const REAL_WORSHIP_SONGS: Song[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    title: "Dios Poderoso",
    artist: "Generación 12",
    key: "Gm",
    bpm: 72,
    notes: "Great for opening worship",
    tags: ["worship", "opening"],
    isDraft: false
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    title: "Ven ante su trono",
    artist: "Elevation Worship",
    key: "D",
    bpm: 76,
    tags: ["worship"],
    isDraft: false
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    title: "Al Que Está Sentado en el Trono",
    artist: "Marcos Brunet",
    key: "A",
    bpm: 84,
    tags: ["worship", "contemporary"],
    isDraft: false
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440004",
    title: "Santo por siempre",
    artist: "La IBI",
    key: "F#m",
    bpm: 68,
    isDraft: false
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440005",
    title: "Espíritu y verdad",
    artist: "Jesus Culture",
    key: "E",
    bpm: 80,
    isDraft: false
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440006",
    title: "Gracia amazingrace",
    artist: "John Newton",
    key: "G",
    bpm: 72,
    isDraft: false
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440007",
    title: "Más que vencedor",
    artist: "Redención",
    key: "Bm",
    bpm: 90,
    isDraft: false
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440008",
    title: "En tu trono me siento",
    artist: "Bethel Music",
    key: "Ab",
    bpm: 74,
    isDraft: false
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440009",
    title: "Glorioso Rei",
    artist: "Thalles Roberto",
    key: "C#m",
    bpm: 88,
    isDraft: false
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440010",
    title: "Consagración",
    artist: "Marcos Witt",
    key: "F",
    bpm: 82,
    isDraft: false
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440011",
    title: "Himno de fe",
    artist: "Paulo Cesar",
    key: "G",
    bpm: 76,
    isDraft: false
  }
]

// Generate variety of songs with faker
const generatedSongs = faker.helpers.multiple(generateMockSong, {
  count: 8
})

// Draft songs
const draftSongs: Song[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440020",
    title: "New Song Draft",
    artist: "Unknown",
    key: "C",
    bpm: 120,
    isDraft: true
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440021",
    title: "Another Draft",
    artist: "Work in Progress",
    key: "Am",
    bpm: 100,
    isDraft: true
  }
]

export const mockSongs: Song[] = [...REAL_WORSHIP_SONGS, ...generatedSongs, ...draftSongs]

export function getSongById(songId: string): Song | undefined {
  return mockSongs.find((song) => song.id === songId)
}

export function getSongsByIds(songIds: string[]): Song[] {
  return mockSongs.filter((song) => songIds.includes(song.id))
}

export function getAllSongs(): Song[] {
  return mockSongs
}

// ============================================================================
// Mock Playlists
// ============================================================================

// Real playlists as base data
const REAL_PLAYLISTS: Playlist[] = [
  {
    id: "1",
    name: "Sunday Morning Worship",
    description: "Opening worship set for Sunday service",
    date: "2024-12-08",
    songs: [
      "550e8400-e29b-41d4-a716-446655440001",
      "550e8400-e29b-41d4-a716-446655440002",
      "550e8400-e29b-41d4-a716-446655440003"
    ],
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
    visibility: "public",
    allowGuestEditing: true,
    shareCode: "ABC123",
    isDraft: false
  },
  {
    id: "2",
    name: "Youth Night",
    description: "Energetic worship songs for youth",
    date: "2024-12-15",
    songs: ["550e8400-e29b-41d4-a716-446655440004", "550e8400-e29b-41d4-a716-446655440005"],
    createdAt: "2024-01-14T10:00:00Z",
    updatedAt: "2024-01-14T10:00:00Z",
    visibility: "public",
    allowGuestEditing: false,
    isDraft: false
  }
]

// Generate variety of playlists with faker
const generatedPlaylists = faker.helpers.multiple(generateMockPlaylist, {
  count: 3
})

export const mockPlaylists: Playlist[] = [...REAL_PLAYLISTS, ...generatedPlaylists]

export function getPlaylistById(playlistId: string): Playlist | undefined {
  return mockPlaylists.find((p) => p.id === playlistId)
}

export function getAllPlaylists(): Playlist[] {
  return mockPlaylists
}

export function getPlaylistByShareCode(shareCode: string): Playlist | undefined {
  return mockPlaylists.find((p) => p.shareCode === shareCode)
}

// ============================================================================
// Mock Teams
// ============================================================================

// Real teams as base data
const REAL_TEAMS: Tables<"teams">[] = [
  {
    id: "team-001",
    name: "Worship Team Alpha",
    description: "Main worship team for Sunday services",

    avatar_url: null,
    icon: "Music",
    is_public: false,
    created_by: "user-001",
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z"
  },
  {
    id: "team-002",
    name: "Youth Band",
    description: "Youth worship and praise band",

    avatar_url: null,
    icon: "Guitar",
    is_public: false,
    created_by: "user-002",
    created_at: "2024-01-14T10:00:00Z",
    updated_at: "2024-01-14T10:00:00Z"
  }
]

// Generate variety of teams with faker
const generatedTeams = faker.helpers.multiple(generateMockTeam, {
  count: 3
})

export const mockTeams: Tables<"teams">[] = [...REAL_TEAMS, ...generatedTeams]

export function getTeamById(teamId: string): Tables<"teams"> | undefined {
  return mockTeams.find((team) => team.id === teamId)
}

export function getAllTeams(): Tables<"teams">[] {
  return mockTeams
}

// ============================================================================
// Mock Activities
// ============================================================================

export function getMockActivities(): Activity[] {
  const now = new Date()
  const actions = [
    "song_created",
    "song_updated",
    "playlist_created",
    "playlist_updated",
    "team_invitation_accepted"
  ] as const
  const entityTypes = ["song", "playlist", "team"] as const

  return faker.helpers.multiple(
    () => {
      const action = faker.helpers.arrayElement(actions)
      const entityType = faker.helpers.arrayElement(entityTypes)
      const hoursAgo = faker.number.int({ min: 1, max: 72 })
      const randomSong = faker.helpers.arrayElement(REAL_WORSHIP_SONGS)
      const randomPlaylist = faker.helpers.arrayElement(REAL_PLAYLISTS)

      return {
        id: faker.string.uuid(),
        action,
        entityType,
        entityId: faker.string.uuid(),
        metadata:
          entityType === "song"
            ? {
                title: randomSong.title,
                ...(faker.helpers.maybe(() => ({
                  changes: faker.helpers.arrayElements(["bpm", "key", "tags"], { min: 1, max: 2 })
                })) ?? {})
              }
            : entityType === "playlist"
              ? {
                  name: randomPlaylist.name,
                  ...(faker.helpers.maybe(() => ({ changes: ["songs"] })) ?? {})
                }
              : {
                  team_name: faker.company.name(),
                  role: faker.helpers.arrayElement(["admin", "member"])
                },
        userId: faker.string.uuid(),
        teamId: faker.helpers.maybe(() => faker.string.uuid(), { probability: 0.5 }) ?? null,
        createdAt: new Date(now.getTime() - hoursAgo * 60 * 60 * 1000).toISOString()
      } as Activity
    },
    { count: 10 }
  )
}

// ============================================================================
// Mock Song with Full Lyrics (for detail page)
// ============================================================================

export const mockSongWithLyrics: Song = {
  id: "550e8400-e29b-41d4-a716-446655440001",
  title: "Dios Poderoso",
  artist: "Generación 12",
  key: "Gm",
  bpm: 72,
  lyrics: `{start_of_verse: Verso 1}
[Gm]¿Quién sino el Señor las estrellas creó
[A#]En su sabiduría guardó
[Gm]Cada galaxia y cada firmamento
[A#]Bajo sus pies se postró

{end_of_verse}

{start_of_chorus}
[Gm]Tú eres el Dios poderoso
[A#]Fuerte en la tempestad
[Gm]Rey de reyes y Señor de señores
[A#]Soberano en la eternidad

{end_of_chorus}

{start_of_verse: Verso 2}
[Gm]Nadie como Tú en el cielo o en la tierra
[A#]Tu poder no tiene par
[Gm]Todo lo que existe fue por tu palabra
[A#]Y todo lo sustentas sin cesar

{end_of_verse}`,
  isDraft: false
}
// ============================================================================
// Mock Dashboard Data
// ============================================================================

export const mockDashboardStats = {
  totalSongs: 24,
  totalPlaylists: 8,
  songsThisMonth: 5,
  upcomingPlaylists: 3
}

export const mockDashboardRecentSongs = [
  {
    id: "1",
    title: "Espíritu y verdad",
    artist: "Marcos Barrientos",
    key: "A",
    bpm: 120,
    addedAt: "2 days ago"
  },
  {
    id: "2",
    title: "Ven ante su trono",
    artist: "Elevation Worship",
    key: "D#",
    bpm: 120,
    addedAt: "3 days ago"
  },
  {
    id: "3",
    title: "Al Que Está Sentado",
    artist: "Marcos Brunet",
    key: "A",
    bpm: 141,
    addedAt: "5 days ago"
  }
]
