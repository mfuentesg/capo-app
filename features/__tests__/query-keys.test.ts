import { activityKeys } from "@/features/activity/hooks/query-keys"
import { dashboardKeys } from "@/features/dashboard/hooks/query-keys"
import { playlistsKeys } from "@/features/playlists/hooks/query-keys"
import { songsKeys } from "@/features/songs/hooks/query-keys"
import { teamsKeys } from "@/features/teams/hooks/query-keys"

describe("query key factories", () => {
  const personalContext = { type: "personal" as const, userId: "user-1" }
  const teamContext = { type: "team" as const, teamId: "team-1", userId: "user-1" }

  it("builds activity query keys", () => {
    expect(activityKeys.all).toEqual(["activity"])
    expect(activityKeys.lists()).toEqual(["activity", "list"])
    expect(activityKeys.list(personalContext)).toEqual(["activity", "list", personalContext])
  })

  it("builds dashboard query keys", () => {
    expect(dashboardKeys.all).toEqual(["dashboard"])
    expect(dashboardKeys.stats(teamContext)).toEqual(["dashboard", "stats", teamContext])
    expect(dashboardKeys.recentSongs(teamContext, 10)).toEqual([
      "dashboard",
      "recentSongs",
      teamContext,
      10
    ])
  })

  it("builds playlist query keys", () => {
    expect(playlistsKeys.all).toEqual(["playlists"])
    expect(playlistsKeys.lists()).toEqual(["playlists", "list"])
    expect(playlistsKeys.list(teamContext)).toEqual(["playlists", "list", teamContext])
    expect(playlistsKeys.details()).toEqual(["playlists", "detail"])
    expect(playlistsKeys.detail("playlist-1")).toEqual(["playlists", "detail", "playlist-1"])
    expect(playlistsKeys.public()).toEqual(["playlists", "public"])
    expect(playlistsKeys.publicByCode("shared-abc")).toEqual([
      "playlists",
      "public",
      "shared-abc"
    ])
  })

  it("builds song query keys", () => {
    expect(songsKeys.all).toEqual(["songs"])
    expect(songsKeys.lists()).toEqual(["songs", "list"])
    expect(songsKeys.list(personalContext)).toEqual(["songs", "list", personalContext])
    expect(songsKeys.details()).toEqual(["songs", "detail"])
    expect(songsKeys.detail("song-2")).toEqual(["songs", "detail", "song-2"])
  })

  it("builds team query keys", () => {
    expect(teamsKeys.all).toEqual(["teams"])
    expect(teamsKeys.lists()).toEqual(["teams", "list"])
    expect(teamsKeys.list()).toEqual(["teams", "list"])
    expect(teamsKeys.details()).toEqual(["teams", "detail"])
    expect(teamsKeys.detail("team-9")).toEqual(["teams", "detail", "team-9"])
    expect(teamsKeys.members("team-9")).toEqual(["teams", "detail", "team-9", "members"])
    expect(teamsKeys.invitations("team-9")).toEqual(["teams", "detail", "team-9", "invitations"])
  })
})
