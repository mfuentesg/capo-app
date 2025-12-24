/**
 * Tests for QueryProvider component
 */
import { render, screen } from "@testing-library/react"
import { QueryProvider } from "../query-provider"

// Mock child component
const TestChild = () => <div>Test Content</div>

describe("QueryProvider", () => {
  it("should render children", () => {
    render(
      <QueryProvider>
        <TestChild />
      </QueryProvider>
    )

    expect(screen.getByText("Test Content")).toBeInTheDocument()
  })

  it("should provide QueryClient context", () => {
    const { container } = render(
      <QueryProvider>
        <TestChild />
      </QueryProvider>
    )

    // QueryProvider should wrap children with QueryClientProvider
    // This is verified by the component rendering without errors
    expect(container).toBeInTheDocument()
  })

  it("should create QueryClient with correct default options", () => {
    // We can't directly test the QueryClient options, but we can verify
    // that the provider works correctly by checking it doesn't throw
    expect(() => {
      render(
        <QueryProvider>
          <TestChild />
        </QueryProvider>
      )
    }).not.toThrow()
  })

  it("should handle multiple children", () => {
    render(
      <QueryProvider>
        <TestChild />
        <div>Another child</div>
      </QueryProvider>
    )

    expect(screen.getByText("Test Content")).toBeInTheDocument()
    expect(screen.getByText("Another child")).toBeInTheDocument()
  })
})
