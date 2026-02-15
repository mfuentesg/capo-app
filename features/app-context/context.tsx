"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useTransition,
  useCallback,
  useRef,
  useMemo,
  type ReactNode
} from "react"
import type { AppContext } from "./types"
import { SELECTED_TEAM_ID_KEY } from "./constants"
import { useUser } from "@/features/auth"
import type { UserInfo } from "@/features/auth"
import { useRouter } from "next/navigation"
import type { Tables } from "@/lib/supabase/database.types"
import {
  setSelectedTeamId as setClientSelectedTeamId,
  unsetSelectedTeamId as unsetClientSelectedTeamId
} from "./server"
import { api, teamsKeys } from "@/features/teams"
import { useQuery, useQueryClient } from "@tanstack/react-query"

interface AppContextContextType {
  context: AppContext | null
  teams: Tables<"teams">[]
  isLoadingTeams: boolean
  setContext: (context: AppContext | null) => void
  switchToPersonal: () => void
  switchToTeam: (teamId: string) => void
  refreshTeams: () => Promise<void>
}

const AppContextContext = createContext<AppContextContextType | undefined>(undefined)

interface AppContextProviderProps {
  children: ReactNode
  initialSelectedTeamId?: string | null
  initialTeams?: Tables<"teams">[]
  initialUser?: UserInfo | null
}

/**
 * AppContext Provider
 * Manages the current app context (personal or team mode)
 */
export function AppContextProvider({
  children,
  initialSelectedTeamId = null,
  initialTeams = [],
  initialUser = null
}: AppContextProviderProps) {
  const { data: user } = useUser(initialUser)
  const router = useRouter()
  const queryClient = useQueryClient()

  const [context, setContextState] = useState<AppContext | null>(() => {
    // CRITICAL: For hydration, we MUST initialize strictly from props.
    // Do NOT check localStorage here, as it causes a Server/Client mismatch.
    const userId = initialUser?.id || ""
    if (initialSelectedTeamId && userId) {
      return { type: "team", teamId: initialSelectedTeamId, userId }
    }
    if (userId) {
      return { type: "personal", userId }
    }
    return null
  })

  // Teams from React Query cache — single source of truth
  const { data: teams = [], isLoading: isLoadingTeams } = useQuery({
    queryKey: teamsKeys.list(),
    queryFn: () => api.getTeams(),
    enabled: !!user?.id,
    initialData: initialTeams.length > 0 ? initialTeams : undefined,
    staleTime: 5 * 60 * 1000
  })

  const [, startTransition] = useTransition()
  const [storedTeamId, setStoredTeamId] = useState<string | null>(null)

  // Track the server-provided initialSelectedTeamId to detect when the server actually changes it
  const lastServerIdRef = useRef(initialSelectedTeamId)
  const isInitialMount = useRef(true)

  // Read from localStorage after client-side hydration
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SELECTED_TEAM_ID_KEY)
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Syncing from external storage after hydration
      setStoredTeamId(stored)
    } catch (error) {
      console.warn("Failed to read from localStorage:", error)
    }
  }, [])

  const refreshTeams = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: teamsKeys.list() })
  }, [queryClient])

  // Initialize/Sync context from server-provided initialSelectedTeamId
  useEffect(() => {
    const currentUserId = user?.id || initialUser?.id
    if (!currentUserId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Resetting context when user logs out
      setContextState(null)
      return
    }

    // Determine if the server just sent us a NEW signal compared to its last one
    const serverPropChanged = lastServerIdRef.current !== initialSelectedTeamId

    if (isInitialMount.current || serverPropChanged) {
      let finalTeamId = initialSelectedTeamId ?? null

      // Post-mount fallback to localStorage ONLY if the server is agnostic (null)
      if (!finalTeamId && isInitialMount.current && typeof window !== "undefined") {
        // Use the value from useLocalStorage hook
        if (
          storedTeamId &&
          (initialTeams.some((t) => t.id === storedTeamId) ||
            teams.some((t) => t.id === storedTeamId))
        ) {
          finalTeamId = storedTeamId
        }
      }

      const targetContext: AppContext = finalTeamId
        ? { type: "team", teamId: finalTeamId, userId: currentUserId }
        : { type: "personal", userId: currentUserId }

      // Update state if different to avoid redundant renders
      const isContextDifferent =
        !context ||
        context.type !== targetContext.type ||
        (context.type === "team" &&
          targetContext.type === "team" &&
          context.teamId !== targetContext.teamId) ||
        context.userId !== targetContext.userId

      if (isContextDifferent) {
        setContextState(targetContext)
      }

      lastServerIdRef.current = initialSelectedTeamId
      isInitialMount.current = false
    }
    // We intentionally ignore 'context' here. This effect is a sync-down from Props only.
  }, [user?.id, initialUser?.id, initialSelectedTeamId, initialTeams, teams, context, storedTeamId])

  // Sync context changes to localStorage for cross-tab communication
  useEffect(() => {
    if (!context) return
    try {
      if (context.type === "team") {
        localStorage.setItem(SELECTED_TEAM_ID_KEY, context.teamId)
        // eslint-disable-next-line react-hooks/set-state-in-effect -- Syncing to external storage
        setStoredTeamId(context.teamId)
      } else {
        localStorage.removeItem(SELECTED_TEAM_ID_KEY)
        setStoredTeamId(null)
      }
    } catch (error) {
      console.warn("Failed to sync context to localStorage:", error)
    }
  }, [context])

  const setContext = useCallback(
    (newContext: AppContext | null) => {
      setContextState(newContext)

      startTransition(async () => {
        if (newContext) {
          if (newContext.type === "team") {
            await setClientSelectedTeamId(newContext.teamId)
          } else {
            await unsetClientSelectedTeamId()
          }
          // Refresh the current page to refetch data with new context
          router.refresh()
        }
      })
    },
    [startTransition, router]
  )

  const switchToPersonal = useCallback(() => {
    if (!user?.id) return
    setContext({
      type: "personal",
      userId: user.id
    })
  }, [user, setContext])

  const switchToTeam = useCallback(
    (teamId: string) => {
      if (!user?.id) return
      setContext({
        type: "team",
        teamId,
        userId: user.id
      })
    },
    [user, setContext]
  )

  return (
    <AppContextContext.Provider
      value={useMemo(
        () => ({
          context,
          teams,
          isLoadingTeams,
          setContext,
          switchToPersonal,
          switchToTeam,
          refreshTeams
        }),
        [context, teams, isLoadingTeams, setContext, switchToPersonal, switchToTeam, refreshTeams]
      )}
    >
      {children}
    </AppContextContext.Provider>
  )
}

/**
 * Hook to access app context
 */
export function useAppContext() {
  const context = useContext(AppContextContext)
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppContextProvider")
  }
  return context
}
