import { applyContextFilter } from "@/lib/supabase/apply-context-filter"
import type { AppContext } from "@/features/app-context"

describe("applyContextFilter", () => {
  const createQuery = () => {
    type QueryMock = {
      eq: (column: string, value: string) => QueryMock
      is: (column: string, value: boolean | null) => QueryMock
    }

    const chain: QueryMock = {
      eq: jest.fn(() => chain),
      is: jest.fn(() => chain)
    }

    return chain
  }

  it("applies personal scope with a null team guard", () => {
    const query = createQuery()
    const context: AppContext = { type: "personal", userId: "user-123" }

    const result = applyContextFilter(query, context)

    expect(result).toBe(query)
    expect(query.eq).toHaveBeenCalledWith("user_id", "user-123")
    expect(query.is).toHaveBeenCalledWith("team_id", null)
    expect(query.eq).toHaveBeenCalledTimes(1)
    expect(query.is).toHaveBeenCalledTimes(1)
  })

  it("applies team scope with a null personal-owner guard", () => {
    const query = createQuery()
    const context: AppContext = { type: "team", teamId: "team-456", userId: "user-123" }

    const result = applyContextFilter(query, context)

    expect(result).toBe(query)
    expect(query.eq).toHaveBeenCalledWith("team_id", "team-456")
    expect(query.is).toHaveBeenCalledWith("user_id", null)
    expect(query.eq).toHaveBeenCalledTimes(1)
    expect(query.is).toHaveBeenCalledTimes(1)
  })
})
