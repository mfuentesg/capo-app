import { renderHook, act } from "@testing-library/react"
import { useChordSearch } from "../hooks/use-chord-search"

describe("useChordSearch", () => {
  it("returns all chords initially", () => {
    const { result } = renderHook(() => useChordSearch())
    expect(result.current.chords.length).toBeGreaterThan(100)
    expect(result.current.query).toBe("")
    expect(result.current.selectedKey).toBeNull()
  })

  it("filters chords by query", () => {
    const { result } = renderHook(() => useChordSearch())
    act(() => result.current.setQuery("maj7"))
    expect(result.current.chords.length).toBeGreaterThan(0)
    result.current.chords.forEach((c) => {
      expect(c.name.toLowerCase() + c.suffix.toLowerCase()).toMatch(/maj7/)
    })
  })

  it("filters chords by key via toggleKey", () => {
    const { result } = renderHook(() => useChordSearch())
    act(() => result.current.toggleKey("G"))
    expect(result.current.selectedKey).toBe("G")
    result.current.chords.forEach((c) => expect(c.key).toBe("G"))
  })

  it("deselects key when toggleKey is called with the same key", () => {
    const { result } = renderHook(() => useChordSearch())
    act(() => result.current.toggleKey("G"))
    act(() => result.current.toggleKey("G"))
    expect(result.current.selectedKey).toBeNull()
  })

  it("combines query and key filter", () => {
    const { result } = renderHook(() => useChordSearch())
    act(() => {
      result.current.setQuery("minor")
      result.current.toggleKey("A")
    })
    result.current.chords.forEach((c) => {
      expect(c.key).toBe("A")
      expect(c.name.toLowerCase() + c.suffix.toLowerCase()).toContain("minor")
    })
  })
})
