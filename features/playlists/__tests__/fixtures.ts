// Re-export mock data from centralized location
export { mockPlaylists } from "@/lib/mock-data"

// For test compatibility, provide individual mock playlist
import { mockPlaylists } from "@/lib/mock-data"
export const mockPlaylist = mockPlaylists[0]
