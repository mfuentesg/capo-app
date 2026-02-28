/**
 * Server-side utilities for App Context
 *
 * These utilities are for use in server components and API routes only.
 * They read from cookies to determine the current app context (personal vs team).
 */

"use server"

import { cookies } from "next/headers"
import type { AppContext } from "./types"
import type { UserInfo } from "@/features/auth"
import type { Tables } from "@/lib/supabase/database.types"
import { SELECTED_TEAM_ID_KEY } from "./constants"
import { createClient } from "@/lib/supabase/server"
import { api as teamsApi } from "@/features/teams"
import { getTeamsWithClient } from "@/features/teams"
import { getUser } from "@/features/auth/api"

export async function setSelectedTeamId(teamId: string) {
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
  const cookieStore = await cookies()
  cookieStore.delete(SELECTED_TEAM_ID_KEY)
}

export async function getSelectedTeamId(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(SELECTED_TEAM_ID_KEY)?.value ?? null
}

export async function getAppContext(): Promise<AppContext | null> {
  const user = await getUser(await createClient())
  if (!user) {
    return null
  }
  return getAppContextFromCookies(user.id)
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

export async function getInitialAppContextData() {
  const supabase = await createClient()
  const user = await getUser(supabase)

  if (!user) {
    return {
      user: null,
      teams: [],
      initialSelectedTeamId: null
    }
  }

  const teams = await getTeamsWithClient(supabase, user.id)
  const selectedTeamId = await getSelectedTeamId()
  const initialSelectedTeamId =
    selectedTeamId && teams.some((team) => team.id === selectedTeamId) ? selectedTeamId : null

  return {
    user,
    teams,
    initialSelectedTeamId
  }
}
