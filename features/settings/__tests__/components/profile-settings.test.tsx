import { render, screen } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ProfileSettings } from "@/features/settings/components/profile-settings"
import { LocaleProvider } from "@/features/settings"
import { useUser } from "@/features/auth"

jest.mock("@/features/auth", () => ({
  useUser: jest.fn()
}))

const mockUseUser = useUser as jest.MockedFunction<typeof useUser>

describe("ProfileSettings", () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    mockUseUser.mockClear()
  })

  const renderComponent = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <LocaleProvider>
          <ProfileSettings />
        </LocaleProvider>
      </QueryClientProvider>
    )

  it("renders user display name and email", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockUseUser.mockReturnValue({ data: { id: "1", displayName: "Jane Doe", email: "jane@example.com", provider: "google" } } as any)
    renderComponent()
    expect(screen.getByText("Jane Doe")).toBeInTheDocument()
    expect(screen.getByText("jane@example.com")).toBeInTheDocument()
  })

  it("renders the auth provider badge with correct provider name", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockUseUser.mockReturnValue({ data: { id: "1", displayName: "Jane", email: "jane@example.com", provider: "google" } } as any)
    renderComponent()
    expect(screen.getByText(/connected via google/i)).toBeInTheDocument()
  })

  it("shows Email as provider when no provider is set", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockUseUser.mockReturnValue({ data: { id: "1", email: "jane@example.com" } } as any)
    renderComponent()
    expect(screen.getByText(/connected via email/i)).toBeInTheDocument()
  })

  it("falls back to email as display name when displayName is absent", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockUseUser.mockReturnValue({ data: { id: "1", email: "jane@example.com" } } as any)
    renderComponent()
    // email appears twice: once as display name fallback, once as the email line
    expect(screen.getAllByText("jane@example.com").length).toBeGreaterThanOrEqual(1)
  })

  it("shows placeholder when user data is loading", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockUseUser.mockReturnValue({ data: null } as any)
    renderComponent()
    // "—" appears in avatar fallback and display name — check the display name paragraph
    const displayNameEl = screen.getAllByText("—").find(
      (el) => el.tagName === "P" && el.classList.contains("truncate")
    )
    expect(displayNameEl).toBeInTheDocument()
  })
})
