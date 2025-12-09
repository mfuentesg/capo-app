/**
 * Test suite for playlist fixtures
 * Validates that mock data is properly structured
 */
import { mockPlaylist, mockPlaylists } from "./fixtures"

describe("Playlist Fixtures", () => {
  describe("mockPlaylist", () => {
    it("should have required properties", () => {
      expect(mockPlaylist).toHaveProperty("id")
      expect(mockPlaylist).toHaveProperty("name")
      expect(mockPlaylist).toHaveProperty("songs")
      expect(mockPlaylist).toHaveProperty("createdAt")
      expect(mockPlaylist).toHaveProperty("updatedAt")
    })

    it("should have valid data types", () => {
      expect(typeof mockPlaylist.id).toBe("string")
      expect(typeof mockPlaylist.name).toBe("string")
      expect(Array.isArray(mockPlaylist.songs)).toBe(true)
      expect(typeof mockPlaylist.createdAt).toBe("string")
      expect(typeof mockPlaylist.updatedAt).toBe("string")
    })

    it("should have non-empty name", () => {
      expect(mockPlaylist.name).toBeTruthy()
    })

    it("should have songs array", () => {
      expect(Array.isArray(mockPlaylist.songs)).toBe(true)
      expect(mockPlaylist.songs.length).toBeGreaterThanOrEqual(0)
    })
  })

  describe("mockPlaylists", () => {
    it("should contain multiple playlists", () => {
      expect(mockPlaylists.length).toBeGreaterThan(0)
    })

    it("should have at least 2 playlists", () => {
      expect(mockPlaylists.length).toBeGreaterThanOrEqual(2)
    })

    it("should all be valid Playlist objects", () => {
      mockPlaylists.forEach((playlist) => {
        expect(playlist).toHaveProperty("id")
        expect(playlist).toHaveProperty("name")
        expect(playlist).toHaveProperty("songs")
      })
    })

    it("should have unique IDs", () => {
      const ids = mockPlaylists.map((p) => p.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })
  })
})
