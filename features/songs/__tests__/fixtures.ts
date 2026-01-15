// Re-export mock data from centralized location
export { mockSongs } from "@/lib/mock-data"

// For test compatibility, provide individual mock song
import { mockSongs } from "@/lib/mock-data"
export const mockSong = mockSongs[0]
