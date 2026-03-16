import { render } from "@testing-library/react"
import { AppContextProvider } from "../context"
import { useViewFilter } from "../view-filter-context"

// Mock server actions
jest.mock("../server", () => ({
  setSelectedTeamId: jest.fn().mockResolvedValue(undefined),
  unsetSelectedTeamId: jest.fn().mockResolvedValue(undefined),
  setViewFilterCookie: jest.fn().mockResolvedValue(undefined)
}))
jest.mock("next/navigation", () => ({ useRouter: () => ({ refresh: jest.fn() }) }))
jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn().mockReturnValue({ data: [], isLoading: false }),
  useQueryClient: jest.fn().mockReturnValue({ invalidateQueries: jest.fn() })
}))
jest.mock("@/features/auth", () => ({ useUser: jest.fn().mockReturnValue({ data: { id: "user-1" } }) }))
jest.mock("@/features/teams/api", () => ({ api: { getTeams: jest.fn().mockResolvedValue([]) } }))
jest.mock("@/features/teams/hooks/query-keys", () => ({ teamsKeys: { list: () => ["teams"] } }))

function TestChild() {
  const { viewFilter } = useViewFilter()
  return <div data-testid="filter">{viewFilter.type}</div>
}

it("initializes viewFilter from initialViewFilter prop", () => {
  const { getByTestId } = render(
    <AppContextProvider initialViewFilter={{ type: "personal" }} initialUser={{ id: "user-1", email: "a@b.com" }}>
      <TestChild />
    </AppContextProvider>
  )
  expect(getByTestId("filter").textContent).toBe("personal")
})
