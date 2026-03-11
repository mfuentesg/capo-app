import { render } from "@testing-library/react"
import SharedPlaylistLoading from "../loading"

jest.mock("@/components/ui/skeleton", () => ({
  Skeleton: ({ className }: { className?: string }) => (
    <div data-testid="skeleton" className={className} />
  )
}))

describe("SharedPlaylistLoading", () => {
  it("renders the page shell without crashing", () => {
    const { container } = render(<SharedPlaylistLoading />)
    expect(container.firstChild).toBeTruthy()
  })

  it("renders 6 song placeholder rows", () => {
    const { container } = render(<SharedPlaylistLoading />)
    const songsList = container.querySelector(".divide-y.rounded-xl")
    expect(songsList?.children).toHaveLength(6)
  })

  it("includes header skeleton elements", () => {
    const { getAllByTestId } = render(<SharedPlaylistLoading />)
    // Header has title, badge, description, metadata + 6 rows × 3 skeletons each
    expect(getAllByTestId("skeleton").length).toBeGreaterThan(6)
  })
})
