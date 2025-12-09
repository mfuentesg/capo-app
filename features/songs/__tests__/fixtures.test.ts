/**
 * Test suite for song fixtures
 * Validates that mock data is properly structured
 */
import { mockSong, mockSongs } from "./fixtures"

describe("Song Fixtures", () => {
  describe("mockSong", () => {
    it("should have required properties", () => {
      expect(mockSong).toHaveProperty("id")
      expect(mockSong).toHaveProperty("title")
      expect(mockSong).toHaveProperty("artist")
      expect(mockSong).toHaveProperty("key")
      expect(mockSong).toHaveProperty("bpm")
    })

    it("should have valid data types", () => {
      expect(typeof mockSong.id).toBe("string")
      expect(typeof mockSong.title).toBe("string")
      expect(typeof mockSong.artist).toBe("string")
      expect(typeof mockSong.key).toBe("string")
      expect(typeof mockSong.bpm).toBe("number")
    })

    it("should have non-empty title and artist", () => {
      expect(mockSong.title).toBeTruthy()
      expect(mockSong.artist).toBeTruthy()
    })
  })

  describe("mockSongs", () => {
    it("should contain multiple songs", () => {
      expect(mockSongs.length).toBeGreaterThan(0)
    })

    it("should have at least 2 songs", () => {
      expect(mockSongs.length).toBeGreaterThanOrEqual(2)
    })

    it("should all be valid Song objects", () => {
      mockSongs.forEach((song) => {
        expect(song).toHaveProperty("id")
        expect(song).toHaveProperty("title")
        expect(song).toHaveProperty("artist")
      })
    })

    it("should have unique IDs", () => {
      const ids = mockSongs.map((s) => s.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })
  })
})
