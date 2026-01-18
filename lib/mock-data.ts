/**
 * Centralized Mock Data
 *
 * This file contains mock/demo data for development and testing.
 * Songs and playlists now use real DB data - this file keeps teams and dashboard mocks.
 */

import { faker } from "@faker-js/faker"
import type { Tables } from "@/lib/supabase/database.types"

function generateMockTeam(): Tables<"teams"> {
  const teamName = faker.company.name()

  return {
    id: faker.string.uuid(),
    name: teamName,
    description: faker.lorem.sentence(),

    avatar_url: null,
    icon: faker.helpers.arrayElement([
      "Music",
      "Users",
      "Star",
      "Heart",
      "Trophy",
      "Rocket",
      "Guitar",
      "Mic2"
    ]),
    is_public: faker.helpers.maybe(() => true, { probability: 0.3 }) ?? false,
    created_by: faker.string.uuid(),
    created_at: faker.date.past().toISOString(),
    updated_at: faker.date.recent().toISOString()
  }
}

const REAL_TEAMS: Tables<"teams">[] = [
  {
    id: faker.string.uuid(),
    name: "Worship Team Alpha",
    description: "Main worship team for Sunday services",

    avatar_url: null,
    icon: "Music",
    is_public: false,
    created_by: faker.string.uuid(),
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z"
  },
  {
    id: faker.string.uuid(),
    name: "Youth Band",
    description: "Youth worship and praise band",

    avatar_url: null,
    icon: "Guitar",
    is_public: false,
    created_by: faker.string.uuid(),
    created_at: "2024-01-14T10:00:00Z",
    updated_at: "2024-01-14T10:00:00Z"
  }
]

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

export const mockDashboardStats = {
  totalSongs: 24,
  totalPlaylists: 8,
  songsThisMonth: 5,
  upcomingPlaylists: 3
}

export const mockDashboardRecentSongs = [
  {
    id: faker.string.uuid(),
    title: "Espíritu y verdad",
    artist: "Marcos Barrientos",
    key: "A",
    bpm: 120,
    addedAt: "2 days ago"
  },
  {
    id: faker.string.uuid(),
    title: "Ven ante su trono",
    artist: "Elevation Worship",
    key: "D#",
    bpm: 120,
    addedAt: "3 days ago"
  },
  {
    id: faker.string.uuid(),
    title: "Al Que Está Sentado",
    artist: "Marcos Brunet",
    key: "A",
    bpm: 141,
    addedAt: "5 days ago"
  }
]
