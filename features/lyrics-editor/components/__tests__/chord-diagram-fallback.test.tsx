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
  DialogDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
}))

// Mock useLocale hook
jest.mock("@/features/settings", () => ({
  useLocale: () => ({
    t: {
      chords: {
        title: "Chord: {chordName}",
        noDiagram: "No diagram available for this chord.",
        positionOf: "Position {current} of {total}",
        variation: "Variation {count}",
        notFound: "not found"
      }
    }
  })
}))

// We don't mock chord-fingering here to test the real integration
// But we might need to mock @tombatossals/react-chords/lib/Chord
jest.mock("@tombatossals/react-chords/lib/Chord", () => ({
  __esModule: true,
  default: (props: { chord: { frets: number[], baseFret: number } }) => (
    <div data-testid="chord-svg">
      Chord SVG: {props.chord.frets.join(",")} (base: {props.chord.baseFret})
    </div>
  ),
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
    // Position 1 of 4 from DB
    expect(screen.getByText("Position 1 of 4")).toBeInTheDocument()
  })
})
