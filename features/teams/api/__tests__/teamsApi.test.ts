import { getTeamsWithClient } from "../teamsApi"

function makeTeamRow(overrides: {
  all_members?: [{ count: number }] | null
  role?: string
} = {}) {
  return {
    team: {
      id: "team-1",
      name: "Worship",
      avatar_url: null,
      icon: null,
      is_public: false,
      created_at: "2026-01-01T00:00:00.000Z",
      created_by: "user-1",
      updated_at: "2026-01-01T00:00:00.000Z",
      all_members: overrides.all_members !== undefined ? overrides.all_members : [{ count: 3 }]
    },
    role: overrides.role ?? "owner"
  }
}

function makeSupabase(result: { data: unknown; error: unknown }) {
  const order = jest.fn().mockResolvedValue(result)
  const eq = jest.fn().mockReturnValue({ order })
  const select = jest.fn().mockReturnValue({ eq })
  const from = jest.fn().mockReturnValue({ select })
  return { supabase: { from }, from, select, eq, order }
}

describe("getTeamsWithClient", () => {
  afterEach(() => jest.clearAllMocks())

  it("issues exactly one query (no second round-trip for counts)", async () => {
    const { supabase, from } = makeSupabase({ data: [], error: null })

    await getTeamsWithClient(supabase as never, "user-1")

    expect(from).toHaveBeenCalledTimes(1)
  })

  it("queries team_members with the embedded all_members count", async () => {
    const { supabase, from, select, eq, order } = makeSupabase({ data: [], error: null })

    await getTeamsWithClient(supabase as never, "user-1")

    expect(from).toHaveBeenCalledWith("team_members")
    expect(select).toHaveBeenCalledWith(
      expect.stringContaining("all_members:team_members!team_id (count)")
    )
    expect(eq).toHaveBeenCalledWith("user_id", "user-1")
    expect(order).toHaveBeenCalledWith("joined_at", { ascending: false })
  })

  it("returns empty array when the user belongs to no teams", async () => {
    const { supabase } = makeSupabase({ data: [], error: null })

    const result = await getTeamsWithClient(supabase as never, "user-1")

    expect(result).toEqual([])
  })

  it("extracts member_count from all_members[0].count", async () => {
    const { supabase } = makeSupabase({ data: [makeTeamRow({ all_members: [{ count: 7 }] })], error: null })

    const result = await getTeamsWithClient(supabase as never, "user-1")

    expect((result[0] as { member_count: number }).member_count).toBe(7)
  })

  it("falls back to member_count of 1 when all_members is null", async () => {
    const { supabase } = makeSupabase({ data: [makeTeamRow({ all_members: null })], error: null })

    const result = await getTeamsWithClient(supabase as never, "user-1")

    expect((result[0] as { member_count: number }).member_count).toBe(1)
  })

  it("maps all team scalar fields and role correctly", async () => {
    const { supabase } = makeSupabase({
      data: [makeTeamRow({ all_members: [{ count: 2 }], role: "admin" })],
      error: null
    })

    const result = await getTeamsWithClient(supabase as never, "user-1")

    expect(result[0]).toMatchObject({
      id: "team-1",
      name: "Worship",
      avatar_url: null,
      icon: null,
      is_public: false,
      created_by: "user-1",
      role: "admin",
      member_count: 2
    })
  })

  it("does not expose the all_members field on returned objects", async () => {
    const { supabase } = makeSupabase({ data: [makeTeamRow()], error: null })

    const result = await getTeamsWithClient(supabase as never, "user-1")

    expect(result[0]).not.toHaveProperty("all_members")
  })

  it("skips rows whose team is null", async () => {
    const { supabase } = makeSupabase({
      data: [
        { team: null, role: "member" },
        makeTeamRow({ all_members: [{ count: 1 }] })
      ],
      error: null
    })

    const result = await getTeamsWithClient(supabase as never, "user-1")

    expect(result).toHaveLength(1)
    expect((result[0] as { id: string }).id).toBe("team-1")
  })

  it("throws when the query returns an error", async () => {
    const { supabase } = makeSupabase({ data: null, error: new Error("connection failed") })

    await expect(getTeamsWithClient(supabase as never, "user-1")).rejects.toThrow(
      "connection failed"
    )
  })
})
