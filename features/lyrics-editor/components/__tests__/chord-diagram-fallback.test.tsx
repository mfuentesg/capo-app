import * as React from "react"
import { render, screen } from "@testing-library/react"
import { ChordDiagram } from "../chord-diagram"

// Mock the Dialog component
jest.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open: boolean }) =>
    open ? <div data-testid="dialog-root">{children}</div> : null,
  DialogContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-content">{children}</div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

// Mock useLocale hook
jest.mock("@/features/settings", () => ({
  useLocale: () => ({
    t: {
      common: {
        previous: "Previous",
        next: "Next"
      },
      chords: {
        title: "Chord: {chordName}",
        noDiagram: "No diagram available for this chord.",
        positionOf: "Position {current} of {total}",
        variation: "Variation {count}",
        notFound: "not found",
        orientation: {
          flipVertical: "Flip (nut at bottom)",
          mirror: "Mirror",
          rh: "RH",
          lh: "LH"
        }
      }
    }
  })
}))

// Mock chord orientation hook
jest.mock("@/hooks/use-chord-orientation", () => ({
  useChordOrientation: () => ({ mirror: false }),
}))

// Mock the shared chord diagram component — receives position prop
jest.mock("@/components/chord-position-diagram", () => ({
  ChordPositionDiagram: (props: { position: { frets: number[]; baseFret: number } }) => (
    <div data-testid="chord-svg">
      Chord SVG: {props.position.frets.join(",")} (base: {props.position.baseFret})
    </div>
  ),
  FingerLegend: () => null,
}))

describe("ChordDiagram Fallback", () => {
  it("uses algorithmic fallback for Cmaj7/B", () => {
    // Cmaj7/B is NOT in chords-db (verified earlier)
    render(<ChordDiagram chordName="Cmaj7/B" onClose={jest.fn()} />)
    
    expect(screen.getByText("Cmaj7/B")).toBeInTheDocument()
    const svg = screen.getByTestId("chord-svg")
    expect(svg).toBeInTheDocument()
    // Expected fingering from chord-fingering for Cmaj7/B is x22010 -> [-1, 2, 2, 0, 1, 0]
    expect(svg).toHaveTextContent("-1,2,2,0,1,0")
  })

  it("still works for standard chords from DB", () => {
    render(<ChordDiagram chordName="C" onClose={jest.fn()} />)
    expect(screen.getByText("C")).toBeInTheDocument()
    expect(screen.getByTestId("chord-svg")).toBeInTheDocument()
    expect(screen.getByLabelText(/Go to variation 1/i)).toBeInTheDocument()
  })
})
