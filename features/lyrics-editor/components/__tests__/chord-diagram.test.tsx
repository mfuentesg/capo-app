import * as React from "react"
import { render, screen } from "@testing-library/react"
import { ChordDiagram } from "../chord-diagram"

// Mock the Dialog component as it uses portals which can be tricky in JSDOM
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

// Mock the shared chord diagram component
jest.mock("@/components/chord-position-diagram", () => ({
  ChordPositionDiagram: () => <div data-testid="chord-svg">Chord SVG</div>,
  FingerLegend: () => null,
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

describe("ChordDiagram", () => {
  it("renders nothing when chordName is null", () => {
    const { container } = render(<ChordDiagram chordName={null} onClose={jest.fn()} />)
    expect(container).toBeEmptyDOMElement()
  })

  it("renders chord diagram for a valid chord (C)", () => {
    render(<ChordDiagram chordName="C" onClose={jest.fn()} />)
    expect(screen.getByText("C")).toBeInTheDocument()
    expect(screen.getByTestId("chord-svg")).toBeInTheDocument()
    // Verify at least one variation button is rendered
    expect(screen.getByLabelText(/Go to variation 1/i)).toBeInTheDocument()
  })

  it("renders chord diagram for a minor chord (Am)", () => {
    render(<ChordDiagram chordName="Am" onClose={jest.fn()} />)
    expect(screen.getByText("Am")).toBeInTheDocument()
  })

  it("shows 'no diagram available' for unknown chords", () => {
    render(<ChordDiagram chordName="Cinvalid" onClose={jest.fn()} />)
    expect(screen.getByText("No diagram available for this chord.")).toBeInTheDocument()
  })

  it("calls onClose when requested", () => {
    const onClose = jest.fn()
    render(<ChordDiagram chordName="C" onClose={onClose} />)
    expect(screen.getByTestId("dialog-root")).toBeInTheDocument()
  })

  describe("definedChords prop", () => {
    const customPosition = {
      frets: [-1, 0, 2, 0, 1, 0],
      fingers: [0, 0, 3, 0, 1, 0],
      baseFret: 5,
      barres: []
    }

    it("shows 'My Chord' label when a defined chord is provided and shown first", () => {
      const definedChords = new Map([["Am11", customPosition]])
      render(<ChordDiagram chordName="Am11" onClose={jest.fn()} definedChords={definedChords} />)
      expect(screen.getByText("My Chord")).toBeInTheDocument()
    })

    it("shows chord diagram when definedChords contains the chord name", () => {
      const definedChords = new Map([["Am11", customPosition]])
      render(<ChordDiagram chordName="Am11" onClose={jest.fn()} definedChords={definedChords} />)
      expect(screen.getByTestId("chord-svg")).toBeInTheDocument()
    })

    it("does not show 'My Chord' label when definedChords is empty", () => {
      const definedChords = new Map<string, typeof customPosition>()
      render(<ChordDiagram chordName="C" onClose={jest.fn()} definedChords={definedChords} />)
      expect(screen.queryByText("My Chord")).not.toBeInTheDocument()
    })

    it("does not show 'My Chord' label when chord name is not in definedChords", () => {
      const definedChords = new Map([["Dm7", customPosition]])
      render(<ChordDiagram chordName="C" onClose={jest.fn()} definedChords={definedChords} />)
      expect(screen.queryByText("My Chord")).not.toBeInTheDocument()
    })

    it("shows 'My Chord' label for an otherwise unknown chord that has a custom definition", () => {
      const definedChords = new Map([["Cinvalid", customPosition]])
      render(<ChordDiagram chordName="Cinvalid" onClose={jest.fn()} definedChords={definedChords} />)
      expect(screen.getByText("My Chord")).toBeInTheDocument()
      expect(screen.getByTestId("chord-svg")).toBeInTheDocument()
    })
  })
})
