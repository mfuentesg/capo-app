"use client"

import { SELECTED_TEAM_ID_KEY } from "./constants"
import {
  setSelectedTeamId as setSelectedTeamIdCookie,
  unsetSelectedTeamId as unsetSelectedTeamIdCookie
} from "./cookies"

/**
 * Set the selected team ID in both cookies and localStorage.
 * Cookies allow server-side access to the current context.
 * localStorage serves as a client-side fallback.
 */
export async function setSelectedTeamId(teamId: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem(SELECTED_TEAM_ID_KEY, teamId)
  }

  // Update cookie via server action
  await setSelectedTeamIdCookie(teamId)
}

/**
 * Unset the selected team ID from both cookies and localStorage.
 * This switches the context back to personal mode.
 */
export async function unsetSelectedTeamId() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(SELECTED_TEAM_ID_KEY)
  }

  // Remove cookie via server action
  await unsetSelectedTeamIdCookie()
}
