"use client"

import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { teamsKeys } from "../hooks/query-keys"
import { api as teamsApi } from "../api"
import { useUser } from "@/features/auth"
import { useAppContext } from "@/features/app-context"
import {
  useDeleteTeam,
  useLeaveTeam,
  useUpdateTeam,
  useTransferOwnershipAndStay,
  useTransferAndLeave
} from "../hooks"
import type { Tables, TablesUpdate } from "@/lib/supabase/database.types"
import { TeamDetailHeader } from "@/features/teams"
import { TeamMembersSection } from "@/features/teams"
import { TeamDangerZone } from "@/features/teams"
import { useSongs } from "@/features/songs/hooks/use-songs"
import { usePlaylists } from "@/features/playlists/hooks/use-playlists"
import { Music, ListMusic, Clock, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import KeyBadge from "@/components/key-badge"
import { Badge } from "@/components/ui/badge"
import { useTranslation } from "@/hooks/use-translation"

interface TeamDetailClientProps {
  initialTeam: Tables<"teams">
  initialMembers: (Tables<"team_members"> & {
    user_full_name: string | null
    user_email: string | null
    user_avatar_url: string | null
  })[]
  initialInvitations: Tables<"team_invitations">[]
}

export function TeamDetailClient({
  initialTeam,
  initialMembers,
  initialInvitations
}: TeamDetailClientProps) {
  const { data: user } = useUser()
  const { context, switchToPersonal } = useAppContext()

  const onTeamActionSuccess = (teamId: string) => {
    if (context?.type === "team" && context.teamId === teamId) {
      switchToPersonal()
    }
  }

  const deleteTeamMutation = useDeleteTeam({ onSuccess: onTeamActionSuccess })
  const leaveTeamMutation = useLeaveTeam({ onSuccess: onTeamActionSuccess })
  const updateTeamMutation = useUpdateTeam()
  const transferOwnershipMutation = useTransferOwnershipAndStay()
  const transferAndLeaveMutation = useTransferAndLeave({ onSuccess: onTeamActionSuccess })

  // Use React Query to manage team data for optimistic updates
  const { data: team = initialTeam } = useQuery<
    Tables<"teams">,
    Error,
    Tables<"teams">,
    readonly unknown[]
  >({
    queryKey: teamsKeys.detail(initialTeam.id),
    queryFn: async () => {
      const teamData = await teamsApi.getTeam(initialTeam.id)
      // Ensure we never return null when we have initialData
      return teamData || initialTeam
    },
    enabled: !!user?.id,
    initialData: initialTeam,
    staleTime: 30 * 1000
  })

  const { data: members } = useQuery<
    (Tables<"team_members"> & {
      user_full_name: string | null
      user_email: string | null
      user_avatar_url: string | null
    })[],
    Error,
    (Tables<"team_members"> & {
      user_full_name: string | null
      user_email: string | null
      user_avatar_url: string | null
    })[],
    readonly unknown[]
  >({
    queryKey: teamsKeys.members(initialTeam.id),
    queryFn: async () => await teamsApi.getTeamMembers(initialTeam.id),
    enabled: !!user?.id,
    initialData: initialMembers as (Tables<"team_members"> & {
      user_full_name: string | null
      user_email: string | null
      user_avatar_url: string | null
    })[],
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000
  })

  const { data: invitations } = useQuery<
    Tables<"team_invitations">[],
    Error,
    Tables<"team_invitations">[],
    readonly unknown[]
  >({
    queryKey: teamsKeys.invitations(initialTeam.id),
    queryFn: async () => await teamsApi.getTeamInvitations(initialTeam.id),
    enabled: !!user?.id,
    initialData: initialInvitations,
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000
  })

  const isOwner = user?.id === team.created_by
  const { t } = useTranslation()
  const resolvedMembers = members ?? initialMembers
  const resolvedInvitations = invitations ?? initialInvitations
  const currentUserRole = resolvedMembers.find((member) => member.user_id === user?.id)?.role

  // Fetch team's shared content
  const teamContext = user ? { type: "team" as const, teamId: initialTeam.id, userId: user.id } : undefined
  const { data: songs = [], isLoading: isSongsLoading } = useSongs(teamContext)
  const { data: playlists = [], isLoading: isPlaylistsLoading } = usePlaylists(teamContext)

  const handleUpdate = (updates: TablesUpdate<"teams">) => {
    updateTeamMutation.mutate({ teamId: team.id, updates })
  }

  const handleDelete = () => {
    deleteTeamMutation.mutate(team.id)
  }

  const handleLeave = () => {
    leaveTeamMutation.mutate(team.id)
  }

  const handleTransferOwnership = (newOwnerId: string) => {
    transferOwnershipMutation.mutate({
      teamId: team.id,
      newOwnerId
    })
  }

  const handleTransferAndLeave = (newOwnerId: string) => {
    transferAndLeaveMutation.mutate({ teamId: team.id, newOwnerId })
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <TeamDetailHeader team={team} onUpdate={handleUpdate} isOwner={isOwner} />

        {/* Team Content Sections */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Team Songs */}
          <div className="rounded-lg border bg-card shadow-sm flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <Music className="h-4 w-4 text-primary" />
                <h3 className="font-semibold">{t.teams.teamSongs || "Team Songs"}</h3>
              </div>
              {songs.length > 0 && (
                <Badge variant="secondary" className="rounded-full">
                  {songs.length}
                </Badge>
              )}
            </div>
            <div className="flex-1 p-2">
              {isSongsLoading ? (
                <div className="space-y-2 p-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 w-full animate-pulse rounded-md bg-muted" />
                  ))}
                </div>
              ) : songs.length > 0 ? (
                <div className="space-y-1">
                  {songs.slice(0, 5).map((song) => (
                    <Link
                      key={song.id}
                      href={`/dashboard/songs/${song.id}`}
                      className="flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-muted/50"
                    >
                      <KeyBadge keyValue={song.key} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{song.title}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{song.artist}</p>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground shrink-0">
                        <Clock className="h-3 w-3" />
                        {song.bpm}
                      </div>
                    </Link>
                  ))}
                  {songs.length > 5 && (
                    <Button variant="ghost" size="sm" className="w-full mt-2 text-xs" asChild>
                      <Link href="/dashboard/songs">
                        {t.dashboard.viewAll}
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Link>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                  <Music className="h-8 w-8 text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground italic">
                    {t.teams.noSharedSongs || "No songs shared with this team yet."}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Team Playlists */}
          <div className="rounded-lg border bg-card shadow-sm flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <ListMusic className="h-4 w-4 text-primary" />
                <h3 className="font-semibold">{t.teams.teamPlaylists || "Team Playlists"}</h3>
              </div>
              {playlists.length > 0 && (
                <Badge variant="secondary" className="rounded-full">
                  {playlists.length}
                </Badge>
              )}
            </div>
            <div className="flex-1 p-2">
              {isPlaylistsLoading ? (
                <div className="space-y-2 p-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 w-full animate-pulse rounded-md bg-muted" />
                  ))}
                </div>
              ) : playlists.length > 0 ? (
                <div className="space-y-1">
                  {playlists.slice(0, 5).map((playlist) => (
                    <Link
                      key={playlist.id}
                      href={`/dashboard/playlists/${playlist.id}`}
                      className="flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-muted/50"
                    >
                      <div className="h-8 w-8 flex items-center justify-center rounded bg-primary/10">
                        <ListMusic className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{playlist.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {playlist.songs.length} {t.playlists.songsCount || "songs"}
                        </p>
                      </div>
                    </Link>
                  ))}
                  {playlists.length > 5 && (
                    <Button variant="ghost" size="sm" className="w-full mt-2 text-xs" asChild>
                      <Link href="/dashboard/playlists">
                        {t.dashboard.viewAll}
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Link>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                  <ListMusic className="h-8 w-8 text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground italic">
                    {t.teams.noSharedPlaylists || "No playlists shared with this team yet."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <TeamMembersSection
          members={resolvedMembers}
          invitations={resolvedInvitations}
          teamId={team.id}
          currentUserId={user?.id}
          currentUserRole={currentUserRole}
        />
        {user && (
          <TeamDangerZone
            teamName={team.name}
            members={resolvedMembers}
            currentUserId={user.id}
            isOwner={isOwner}
            onLeave={handleLeave}
            onDelete={handleDelete}
            onTransferOwnership={handleTransferOwnership}
            onTransferAndLeave={handleTransferAndLeave}
            isDeleting={deleteTeamMutation.isPending}
            isTransferring={
              transferOwnershipMutation.isPending || transferAndLeaveMutation.isPending
            }
            isLeaving={leaveTeamMutation.isPending}
          />
        )}
      </div>
    </div>
  )
}
