/**
 * Tests for OptimizedLogo component
 */
import { render, screen } from "@testing-library/react"
import { OptimizedLogo } from "../optimized-logo"

// Mock next/image for SVG fallback
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />
  }
}))

describe("OptimizedLogo", () => {
  it("should render optimized raster version by default", () => {
    render(<OptimizedLogo name="capo" width={150} height={150} alt="Test Logo" />)

    const picture = screen.getByRole("img", { hidden: true }).closest("picture")
    expect(picture).toBeInTheDocument()

    const sources = picture?.querySelectorAll("source")
    expect(sources).toHaveLength(1)
    expect(sources?.[0]).toHaveAttribute("type", "image/webp")
    expect(sources?.[0]).toHaveAttribute(
      "srcSet",
      "/img/optimized/capo@2x.webp 2x, /img/optimized/capo.webp 1x"
    )
  })

  it("should render img with PNG fallback", () => {
    render(<OptimizedLogo name="capo" width={150} height={150} alt="Test Logo" />)

    const img = screen.getByRole("img", { hidden: true })
    expect(img).toHaveAttribute("src", "/img/optimized/capo.png")
    expect(img).toHaveAttribute(
      "srcSet",
      "/img/optimized/capo@2x.png 2x, /img/optimized/capo.png 1x"
    )
    expect(img).toHaveAttribute("width", "150")
    expect(img).toHaveAttribute("height", "150")
  })

  it("should use SVG when useSvg prop is true", () => {
    render(<OptimizedLogo name="capo" width={150} height={150} alt="Test Logo" useSvg />)

    const img = screen.getByAltText("Test Logo")
    expect(img).toHaveAttribute("src", "/img/capo.svg")
    expect(img.closest("picture")).not.toBeInTheDocument()
  })

  it("should handle capo-text logo", () => {
    render(<OptimizedLogo name="capo-text" width={80} height={24} alt="Text Logo" />)

    const picture = screen.getByRole("img", { hidden: true }).closest("picture")
    expect(picture).toBeInTheDocument()

    const source = picture?.querySelector("source")
    expect(source).toHaveAttribute(
      "srcSet",
      "/img/optimized/capo-text@2x.webp 2x, /img/optimized/capo-text.webp 1x"
    )

    const img = screen.getByRole("img", { hidden: true })
    expect(img).toHaveAttribute("src", "/img/optimized/capo-text.png")
  })

  it("should set priority loading when priority prop is true", () => {
    render(<OptimizedLogo name="capo" width={150} height={150} alt="Test Logo" priority />)

    const img = screen.getByRole("img", { hidden: true })
    expect(img).toHaveAttribute("loading", "eager")
    expect(img).toHaveAttribute("fetchPriority", "high")
  })

  it("should set lazy loading when priority prop is false", () => {
    render(<OptimizedLogo name="capo" width={150} height={150} alt="Test Logo" priority={false} />)

    const img = screen.getByRole("img", { hidden: true })
    expect(img).toHaveAttribute("loading", "lazy")
    expect(img).toHaveAttribute("fetchPriority", "auto")
  })

  it("should apply className prop", () => {
    render(
      <OptimizedLogo
        name="capo"
        width={150}
        height={150}
        alt="Test Logo"
        className="custom-class dark:invert"
      />
    )

    const img = screen.getByRole("img", { hidden: true })
    expect(img).toHaveClass("custom-class", "dark:invert")
  })

  it("should set explicit width and height in style to prevent layout shift", () => {
    render(<OptimizedLogo name="capo" width={150} height={150} alt="Test Logo" />)

    const img = screen.getByRole("img", { hidden: true })
    expect(img).toHaveStyle({ width: "150px", height: "150px" })
  })

  it("should include decoding attribute for async decoding", () => {
    render(<OptimizedLogo name="capo" width={150} height={150} alt="Test Logo" />)

    const img = screen.getByRole("img", { hidden: true })
    expect(img).toHaveAttribute("decoding", "async")
  })

  it("should preserve additional props", () => {
    render(
      <OptimizedLogo
        name="capo"
        width={150}
        height={150}
        alt="Test Logo"
        data-testid="custom-logo"
        aria-label="Custom label"
      />
    )

    const img = screen.getByRole("img", { hidden: true })
    expect(img).toHaveAttribute("data-testid", "custom-logo")
    expect(img).toHaveAttribute("aria-label", "Custom label")
  })
})

