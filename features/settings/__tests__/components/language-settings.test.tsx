import { render, screen, fireEvent } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { LanguageSettings } from "@/features/settings/components/language-settings"
import { LocaleProvider } from "@/features/settings"
import { locales, localeNames } from "@/lib/i18n/config"

describe("LanguageSettings", () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  })

  const renderComponent = (initialLocale?: "en" | "es") =>
    render(
      <QueryClientProvider client={queryClient}>
        <LocaleProvider initialLocale={initialLocale ?? "en"}>
          <LanguageSettings />
        </LocaleProvider>
      </QueryClientProvider>
    )

  it("renders a radio option for each available locale", () => {
    renderComponent()
    for (const loc of locales) {
      expect(screen.getByRole("radio", { name: localeNames[loc] })).toBeInTheDocument()
    }
  })

  it("marks the current locale as checked", () => {
    renderComponent("es")
    expect(screen.getByRole("radio", { name: localeNames["es"] })).toBeChecked()
    expect(screen.getByRole("radio", { name: localeNames["en"] })).not.toBeChecked()
  })

  it("switches locale when a different option is selected", () => {
    renderComponent("en")
    const esRadio = screen.getByRole("radio", { name: localeNames["es"] })
    fireEvent.click(esRadio)
    expect(esRadio).toBeChecked()
  })

  it("renders a radiogroup", () => {
    renderComponent()
    expect(screen.getByRole("radiogroup")).toBeInTheDocument()
  })
})
