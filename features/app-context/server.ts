/**
 * Server-side utilities for App Context
 *
 * These utilities are for use in server components and API routes only.
 * They read from cookies to determine the current app context (personal vs team).
 */

"use server"

import { cookies } from "next/headers"
import type { AppContext } from "./types"
import { SELECTED_TEAM_ID_KEY } from "./constants"
import { createClient } from "@/lib/supabase/server"
import { getTeamsWithClient } from "@/features/teams/api/teamsApi"
import type { UserInfo } from "@/features/auth/types"
export async function setSelectedTeamId(teamId: string) {
  const cookieStore = await cookies()
  cookieStore.set(SELECTED_TEAM_ID_KEY, teamId, {
    path: "/",
    maxAge: 31536000,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  })
}

export async function unsetSelectedTeamId() {
  const cookieStore = await cookies()
  cookieStore.delete(SELECTED_TEAM_ID_KEY)
}

/**
 * Get the selected team ID from cookies (server-side only)
 *
 * @returns The selected team ID, or null if in personal context
 */
export async function getSelectedTeamIdFromCookies(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(SELECTED_TEAM_ID_KEY)?.value ?? null
}

/**
 * Get the AppContext from cookies (server-side only)
 *
 * @param userId - The current user ID
 * @returns The AppContext based on cookies (team or personal)
 */
export async function getAppContextFromCookies(userId: string): Promise<AppContext> {
  const selectedTeamId = await getSelectedTeamIdFromCookies()

  if (selectedTeamId) {
    // Validate that the user is actually a member of this team
    const supabase = await createClient()
    const teams = await getTeamsWithClient(supabase, userId)
    const isValid = teams.some((t) => t.id === selectedTeamId)

    if (isValid) {
      return {
        type: "team",
        teamId: selectedTeamId,
        userId
      }
    }
  }

  return {
    type: "personal",
    userId
  }
}

/**
 * Get the initial context data needed for the AppContextProvider
 * This fetches user, teams, and validates the selected team ID in one pass.
 */
export async function getInitialAppContextData() {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      user: null as UserInfo | null,
      teams: [],
      initialSelectedTeamId: null
    }
  }

  const userInfo: UserInfo = {
    id: user.id,
    email: user.email,
    avatarUrl: (user.user_metadata?.avatar_url as string | undefined) || undefined,
    fullName: (user.user_metadata?.full_name as string | undefined) || undefined,
    displayName: (user.user_metadata?.name as string | undefined) || undefined
  }

  const [teams, selectedTeamId] = await Promise.all([
    getTeamsWithClient(supabase, user.id),
    getSelectedTeamIdFromCookies()
  ])

  // Validate selected team ID
  const validSelectedTeamId = selectedTeamId && teams.some((t) => t.id === selectedTeamId) 
    ? selectedTeamId 
    : null

  return {
    user: userInfo,
    teams,
    initialSelectedTeamId: validSelectedTeamId
  }
}
