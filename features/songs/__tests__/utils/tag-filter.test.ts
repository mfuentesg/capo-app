import type { Song } from "@/features/songs/types"

// Extracted filter predicate matching song-list.tsx implementation
function matchesTags(song: Pick<Song, "tags">, selectedTags: string[]): boolean {
  if (selectedTags.length === 0) return true
  return selectedTags.every((tag) => song.tags?.includes(tag))
}

const makeSong = (tags: string[]): Pick<Song, "tags"> => ({ tags })

describe("tag filter predicate", () => {
  it("matches all songs when no tags are selected", () => {
    expect(matchesTags(makeSong(["worship"]), [])).toBe(true)
    expect(matchesTags(makeSong([]), [])).toBe(true)
  })

  it("matches song that has the selected tag", () => {
    expect(matchesTags(makeSong(["worship", "upbeat"]), ["worship"])).toBe(true)
  })

  it("rejects song that does not have the selected tag", () => {
    expect(matchesTags(makeSong(["upbeat"]), ["worship"])).toBe(false)
  })

  it("uses AND logic: song must have ALL selected tags", () => {
    expect(matchesTags(makeSong(["worship", "upbeat"]), ["worship", "upbeat"])).toBe(true)
    expect(matchesTags(makeSong(["worship"]), ["worship", "upbeat"])).toBe(false)
  })

  it("matches song with no tags only when no tags are selected", () => {
    expect(matchesTags(makeSong([]), ["worship"])).toBe(false)
    expect(matchesTags(makeSong([]), [])).toBe(true)
  })

  it("handles undefined tags gracefully", () => {
    expect(matchesTags({ tags: undefined }, ["worship"])).toBe(false)
    expect(matchesTags({ tags: undefined }, [])).toBe(true)
  })
})
