/**
 * Tests for LoginForm component
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, waitFor, fireEvent } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { LoginForm } from "@/features/auth/components/login-form"
import { useSignInWithGoogle } from "@/features/auth/hooks"
import { LocaleProvider } from "@/contexts/locale-context"

// Mock next/navigation
const mockSearchParams = new URLSearchParams()
const mockGet = jest.fn((key: string) => mockSearchParams.get(key))
jest.mock("next/navigation", () => ({
  useSearchParams: jest.fn(() => ({
    get: mockGet
  }))
}))

// Mock OptimizedLogo component
jest.mock("@/components/optimized-logo", () => ({
  OptimizedLogo: (props: Record<string, unknown>) => {
    // Filter out non-HTML props
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { priority, name, useSvg, ...imgProps } = props
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...imgProps} />
  }
}))

// Mock useSignInWithGoogle hook
jest.mock("../../hooks", () => ({
  useSignInWithGoogle: jest.fn()
}))

const mockUseSignInWithGoogle = useSignInWithGoogle as jest.MockedFunction<
  typeof useSignInWithGoogle
>

describe("LoginForm", () => {
  let queryClient: QueryClient
  let mockMutateAsync: jest.Mock

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    })

    mockMutateAsync = jest.fn()
    mockUseSignInWithGoogle.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
      isError: false,
      isSuccess: false,
      error: null,
      reset: jest.fn()
    } as any)

    mockSearchParams.delete("error")
    mockGet.mockImplementation((key: string) => mockSearchParams.get(key))
  })

  afterEach(() => {
    jest.clearAllMocks()
    queryClient.clear()
  })

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <LocaleProvider>{component}</LocaleProvider>
      </QueryClientProvider>
    )
  }

  it("should render login form with all elements", () => {
    renderWithProviders(<LoginForm />)

    expect(screen.getByText("Welcome to Capo")).toBeInTheDocument()
    expect(screen.getByText("Sign in to start creating and sharing your music")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Login with Google/i })).toBeInTheDocument()
  })

  it("should show loading state when button is clicked", async () => {
    mockMutateAsync.mockResolvedValue({ url: "https://accounts.google.com" })

    renderWithProviders(<LoginForm />)

    const button = screen.getByRole("button", { name: /Login with Google/i })
    expect(button).not.toBeDisabled()

    fireEvent.click(button)

    await waitFor(() => {
      expect(button).toBeDisabled()
    })

    expect(screen.getByText("Logging in")).toBeInTheDocument()
    expect(mockMutateAsync).toHaveBeenCalledTimes(1)
  })

  it("should keep loading state after successful mutation", async () => {
    mockMutateAsync.mockResolvedValue({ url: "https://accounts.google.com" })

    renderWithProviders(<LoginForm />)

    const button = screen.getByRole("button", { name: /Login with Google/i })
    fireEvent.click(button)

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalled()
    })

    // Button should still be disabled after mutation completes
    expect(button).toBeDisabled()
    expect(screen.getByText("Logging in")).toBeInTheDocument()
  })

  it("should reset loading state on mutation error", async () => {
    const mockError = new Error("OAuth failed")
    mockMutateAsync.mockRejectedValue(mockError)

    renderWithProviders(<LoginForm />)

    const button = screen.getByRole("button", { name: /Login with Google/i })
    fireEvent.click(button)

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalled()
    })

    // After error, button should be enabled again
    await waitFor(() => {
      expect(button).not.toBeDisabled()
    })

    expect(screen.queryByText("Logging in")).not.toBeInTheDocument()
    expect(screen.getByText("Login with Google")).toBeInTheDocument()
  })

  it("should reset loading state when error is present in URL params", async () => {
    mockMutateAsync.mockResolvedValue({ url: "https://accounts.google.com" })

    const { rerender } = renderWithProviders(<LoginForm />)

    const button = screen.getByRole("button", { name: /Login with Google/i })
    fireEvent.click(button)

    await waitFor(() => {
      expect(button).toBeDisabled()
    })

    // Simulate error in URL params
    mockSearchParams.set("error", "auth_failed")
    mockGet.mockImplementation((key: string) => mockSearchParams.get(key))

    rerender(
      <QueryClientProvider client={queryClient}>
        <LocaleProvider>
          <LoginForm />
        </LocaleProvider>
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(button).not.toBeDisabled()
    })

    expect(screen.queryByText("Logging in")).not.toBeInTheDocument()
    expect(screen.getByText("Login with Google")).toBeInTheDocument()
  })

  it("should show spinning Google icon and logging in text when loading", async () => {
    mockMutateAsync.mockResolvedValue({ url: "https://accounts.google.com" })

    renderWithProviders(<LoginForm />)

    const button = screen.getByRole("button", { name: /Login with Google/i })
    fireEvent.click(button)

    await waitFor(() => {
      expect(button).toBeDisabled()
    })

    // Google icon should be present and have animate-spin class
    const googleIcon = button.querySelector('svg[viewBox="0 0 24 24"]')
    expect(googleIcon).toBeInTheDocument()
    expect(googleIcon).toHaveClass("animate-spin")

    // Should show "Logging in" text
    expect(screen.getByText("Logging in")).toBeInTheDocument()
  })

  it("should show Google icon and login text when not loading", () => {
    renderWithProviders(<LoginForm />)

    const button = screen.getByRole("button", { name: /Login with Google/i })

    // Google icon should be present and NOT spinning
    const googleIcon = button.querySelector('svg[viewBox="0 0 24 24"]')
    expect(googleIcon).toBeInTheDocument()
    expect(googleIcon).not.toHaveClass("animate-spin")

    // Should show login text
    expect(screen.getByText("Login with Google")).toBeInTheDocument()

    // Should not show "Logging in" text
    expect(screen.queryByText("Logging in")).not.toBeInTheDocument()
  })

  it("should handle multiple rapid clicks gracefully", async () => {
    mockMutateAsync.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ url: "https://accounts.google.com" }), 100)
        )
    )

    renderWithProviders(<LoginForm />)

    const button = screen.getByRole("button", { name: /Login with Google/i })

    // Click multiple times rapidly
    fireEvent.click(button)
    fireEvent.click(button)
    fireEvent.click(button)

    await waitFor(() => {
      expect(button).toBeDisabled()
    })

    // Should only call mutateAsync once (button is disabled after first click)
    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledTimes(1)
    })
  })

  it("should accept custom className", () => {
    const { container } = renderWithProviders(<LoginForm className="custom-class" />)
    const formContainer = container.firstChild
    expect(formContainer).toHaveClass("custom-class")
  })
})
