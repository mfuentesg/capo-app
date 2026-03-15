import { render, screen, fireEvent } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ThemeSettings } from "@/features/settings/components/theme-settings"
import { LocaleProvider } from "@/features/settings"
import { setThemeAction } from "@/lib/actions/theme"

jest.mock("next-themes", () => ({
  useTheme: jest.fn()
}))

jest.mock("@/lib/actions/theme", () => ({
  setThemeAction: jest.fn().mockResolvedValue(undefined)
}))

jest.mock("react", () => ({
  ...jest.requireActual("react"),
  useSyncExternalStore: jest.fn((_subscribe: unknown, getSnapshot: () => unknown) => getSnapshot())
}))

import { useTheme } from "next-themes"

const mockUseTheme = useTheme as jest.MockedFunction<typeof useTheme>

describe("ThemeSettings", () => {
  let queryClient: QueryClient
  const mockSetTheme = jest.fn()

  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    mockSetTheme.mockClear()
    ;(setThemeAction as jest.Mock).mockClear()
    mockUseTheme.mockReturnValue({
      theme: "light",
      setTheme: mockSetTheme,
      themes: ["light", "dark", "system"],
      resolvedTheme: "light",
      systemTheme: "light",
      forcedTheme: undefined
    })
  })

  const renderComponent = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <LocaleProvider>
          <ThemeSettings />
        </LocaleProvider>
      </QueryClientProvider>
    )

  it("renders all three theme options", () => {
    renderComponent()
    expect(screen.getByRole("radio", { name: /light/i })).toBeInTheDocument()
    expect(screen.getByRole("radio", { name: /dark/i })).toBeInTheDocument()
    expect(screen.getByRole("radio", { name: /system/i })).toBeInTheDocument()
  })

  it("marks the active theme as checked", () => {
    renderComponent()
    expect(screen.getByRole("radio", { name: /light/i })).toBeChecked()
    expect(screen.getByRole("radio", { name: /dark/i })).not.toBeChecked()
    expect(screen.getByRole("radio", { name: /system/i })).not.toBeChecked()
  })

  it("calls setTheme and setThemeAction when a theme is selected", () => {
    renderComponent()
    fireEvent.click(screen.getByRole("radio", { name: /dark/i }))
    expect(mockSetTheme).toHaveBeenCalledWith("dark")
    expect(setThemeAction).toHaveBeenCalledWith("dark")
  })

  it("renders a radiogroup with accessible label", () => {
    renderComponent()
    expect(screen.getByRole("radiogroup")).toBeInTheDocument()
  })
})
