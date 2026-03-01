"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getUserSongSettingsAction,
  upsertUserSongSettingsAction
} from "../api/actions"
import { songsKeys } from "./query-keys"
import type { Song, UserSongSettings } from "../types"

/**
 * Fetches the current user's personal settings for a specific song.
 * Returns null when no personal settings have been saved yet.
 */
export function useUserSongSettings(song: Song) {
  return useQuery({
    queryKey: songsKeys.userSettings(song.id),
    queryFn: () => getUserSongSettingsAction(song.id),
    staleTime: 60_000
  })
}

/**
 * Mutation to upsert the current user's personal settings for a song.
 * Merges partial updates with existing cached settings so that updating
 * only capo never resets transpose or font size.
 */
export function useUpsertUserSongSettings(song: Song) {
  const queryClient = useQueryClient()
  const queryKey = songsKeys.userSettings(song.id)

  return useMutation({
    mutationFn: async (updates: Partial<Omit<UserSongSettings, "songId">>) => {
      const existing = queryClient.getQueryData<UserSongSettings | null>(queryKey)
      const merged: Omit<UserSongSettings, "songId"> = {
        transpose: updates.transpose ?? existing?.transpose ?? song.transpose ?? 0,
        capo: updates.capo ?? existing?.capo ?? song.capo ?? 0,
        fontSize: updates.fontSize ?? existing?.fontSize ?? song.fontSize
      }
      return upsertUserSongSettingsAction(song.id, merged)
    },
    onMutate: async (updates) => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<UserSongSettings | null>(queryKey)
      queryClient.setQueryData<UserSongSettings>(queryKey, (old) => ({
        songId: song.id,
        transpose: updates.transpose ?? old?.transpose ?? song.transpose ?? 0,
        capo: updates.capo ?? old?.capo ?? song.capo ?? 0,
        fontSize: updates.fontSize ?? old?.fontSize ?? song.fontSize
      }))
      return { previous }
    },
    onError: (_err, _updates, context) => {
      queryClient.setQueryData(queryKey, context?.previous)
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKey, data)
    }
  })
}

/**
 * Returns the effective settings for a song: user's personal overrides when available,
 * falling back to the song's authored defaults.
 */
export function useEffectiveSongSettings(song: Song) {
  const { data: userSettings } = useUserSongSettings(song)
  return {
    transpose: userSettings?.transpose ?? song.transpose ?? 0,
    capo: userSettings?.capo ?? song.capo ?? 0,
    fontSize: userSettings?.fontSize ?? song.fontSize ?? 1
  }
}
