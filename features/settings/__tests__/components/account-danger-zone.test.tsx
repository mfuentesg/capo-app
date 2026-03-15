import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AccountDangerZone } from "@/features/settings/components/account-danger-zone"
import { LocaleProvider } from "@/features/settings"
import { deleteAccountAction } from "@/features/settings/api/actions"

jest.mock("@/features/settings/api/actions", () => ({
  deleteAccountAction: jest.fn()
}))

const mockDeleteAccountAction = deleteAccountAction as jest.MockedFunction<typeof deleteAccountAction>

describe("AccountDangerZone", () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    mockDeleteAccountAction.mockClear()
  })

  const renderComponent = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <LocaleProvider>
          <AccountDangerZone />
        </LocaleProvider>
      </QueryClientProvider>
    )

  it("renders the delete account button initially", () => {
    renderComponent()
    expect(screen.getByRole("button", { name: /delete account/i })).toBeInTheDocument()
    expect(screen.queryByText(/are you sure/i)).not.toBeInTheDocument()
  })

  it("shows confirmation step when delete button is clicked", () => {
    renderComponent()
    fireEvent.click(screen.getByRole("button", { name: /delete account/i }))
    expect(screen.getByText(/are you sure/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /yes, delete my account/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument()
  })

  it("hides the confirmation step when cancel is clicked", () => {
    renderComponent()
    fireEvent.click(screen.getByRole("button", { name: /delete account/i }))
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }))
    expect(screen.getByRole("button", { name: /delete account/i })).toBeInTheDocument()
    expect(screen.queryByText(/are you sure/i)).not.toBeInTheDocument()
  })

  it("calls deleteAccountAction when confirm button is clicked", async () => {
    mockDeleteAccountAction.mockResolvedValue(undefined)
    renderComponent()
    fireEvent.click(screen.getByRole("button", { name: /delete account/i }))
    fireEvent.click(screen.getByRole("button", { name: /yes, delete my account/i }))
    await waitFor(() => {
      expect(mockDeleteAccountAction).toHaveBeenCalledTimes(1)
    })
  })
})
