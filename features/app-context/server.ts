/**
 * Server-side utilities for App Context
 *
 * These utilities are for use in server components and API routes only.
 * They read from cookies to determine the current app context (personal vs team).
 */

"use server"

import type { AppContext, ViewFilter } from "./types"
import type { UserInfo } from "@/features/auth"
import type { Tables } from "@/lib/supabase/database.types"
import { SELECTED_TEAM_ID_KEY, VIEW_FILTER_KEY } from "./constants"
import { createClient } from "@/lib/supabase/server"
import { api as teamsApi, getTeamsWithClient } from "@/features/teams/api"
import { getUser } from "@/features/auth/api"

export async function setSelectedTeamId(teamId: string) {
  const { cookies } = await import("next/headers")
  const cookieStore = await cookies()
  cookieStore.set(SELECTED_TEAM_ID_KEY, teamId, {
    path: "/",
    maxAge: 31536000,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  })
}

export async function unsetSelectedTeamId() {
  const { cookies } = await import("next/headers")
  const cookieStore = await cookies()
  cookieStore.delete(SELECTED_TEAM_ID_KEY)
}

export async function getSelectedTeamId(): Promise<string | null> {
  const { cookies } = await import("next/headers")
  const cookieStore = await cookies()
  return cookieStore.get(SELECTED_TEAM_ID_KEY)?.value ?? null
}

async function getViewFilterCookie(): Promise<"all" | "personal" | "team" | null> {
  const { cookies } = await import("next/headers")
  const cookieStore = await cookies()
  const value = cookieStore.get(VIEW_FILTER_KEY)?.value
  if (value === "all" || value === "personal" || value === "team") return value
  return null
}

export async function setViewFilterCookie(type: "all" | "personal" | "team") {
  const { cookies } = await import("next/headers")
  const cookieStore = await cookies()
  if (type === "all") {
    cookieStore.delete(VIEW_FILTER_KEY)
  } else {
    cookieStore.set(VIEW_FILTER_KEY, type, {
      path: "/",
      maxAge: 31536000,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production"
    })
  }
}

export async function getAppContext(): Promise<AppContext | null> {
  const supabase = await createClient()

  // Get user first (verified, secure)
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const userId = user.id

  // Fetch teams and selected team ID in parallel
  const [teams, selectedTeamId] = await Promise.all([
    getTeamsWithClient(supabase, userId),
    getSelectedTeamId()
  ])

  if (selectedTeamId) {
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

export async function isTeamContext(): Promise<boolean> {
  const context = await getAppContext()
  return context?.type === "team"
}

export async function getCurrentUser(): Promise<UserInfo | null> {
  const supabase = await createClient()
  return getUser(supabase)
}

export async function getUserTeams(): Promise<Tables<"teams">[]> {
  const user = await getUser(await createClient())
  if (!user) {
    return []
  }
  return teamsApi.getTeams()
}

export async function getAppContextFromCookies(userId: string): Promise<AppContext> {
  const selectedTeamId = await getSelectedTeamId()

  if (selectedTeamId) {
    const teams = await teamsApi.getTeams()
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

import { cache } from "react"
import { getUserPreferences } from "@/features/songs/api/user-preferences-api"

export const getInitialAppContextData = cache(async () => {
  const supabase = await createClient()

  // Get user first (verified, secure)
  const {
    data: { user: authUser }
  } = await supabase.auth.getUser()

  if (!authUser) {
    return {
      user: null,
      teams: [],
      initialSelectedTeamId: null,
      preferences: null,
      initialViewFilter: { type: "all" } as const
    }
  }

  const userId = authUser.id

  // Fetch user profile, teams, preferences, selected team ID, and view filter in parallel
  const [userProfile, teams, selectedTeamId, preferences, rawViewFilter] = await Promise.all([
    getUser(supabase),
    getTeamsWithClient(supabase, userId),
    getSelectedTeamId(),
    getUserPreferences(supabase, userId).catch(() => null),
    getViewFilterCookie()
  ])

  if (!userProfile) {
    return {
      user: null,
      teams: [],
      initialSelectedTeamId: null,
      preferences: null,
      initialViewFilter: { type: "all" } as const
    }
  }

  const initialSelectedTeamId =
    selectedTeamId && teams.some((team) => team.id === selectedTeamId) ? selectedTeamId : null

  let initialViewFilter: ViewFilter = { type: "all" }
  if (rawViewFilter === "personal") {
    initialViewFilter = { type: "personal" }
  } else if (rawViewFilter === "team") {
    if (initialSelectedTeamId) {
      initialViewFilter = { type: "team", teamId: initialSelectedTeamId }
    } else {
      // Stale team ID — reset cookie
      const { cookies } = await import("next/headers")
      const cookieStore = await cookies()
      cookieStore.delete(VIEW_FILTER_KEY)
      initialViewFilter = { type: "all" }
    }
  }

  return {
    user: userProfile,
    teams,
    initialSelectedTeamId,
    preferences,
    initialViewFilter
  }
})
