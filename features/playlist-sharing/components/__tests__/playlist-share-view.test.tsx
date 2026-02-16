import { render, screen } from "@testing-library/react"
import type { ReactNode } from "react"
import { PlaylistShareView } from "../playlist-share-view"
import { LocaleProvider } from "@/features/settings"
import type { PlaylistWithSongs } from "@/features/playlists/types"

jest.mock("next/link", () => {
  return {
    __esModule: true,
    default: ({ href, children }: { href: string; children: ReactNode }) => (
      <a href={href}>{children}</a>
    )
  }
})

const playlist: PlaylistWithSongs = {
  id: "playlist-public-1",
  name: "Shared Set",
  description: "Server sorted playlist",
  songs: [
    {
      id: "song-2",
      title: "Second Song",
      artist: "Artist B",
      key: "G",
      bpm: 108
    },
    {
      id: "song-1",
      title: "First Song",
      artist: "Artist A",
      key: "C",
      bpm: 96
    }
  ],
  createdAt: "2026-02-01T00:00:00.000Z",
  updatedAt: "2026-02-01T00:00:00.000Z",
  visibility: "public",
  allowGuestEditing: true,
  shareCode: "share-code-123"
}

describe("PlaylistShareView", () => {
  it("should render server-provided songs in order without client refetch dependency", () => {
    render(
      <LocaleProvider>
        <PlaylistShareView playlist={playlist} />
      </LocaleProvider>
    )

    // Song rows are rendered immediately from props in the same order they were provided.
    const songHeadings = screen.getAllByRole("heading", { level: 3 })
    expect(songHeadings.map((heading) => heading.textContent)).toEqual(["Second Song", "First Song"])

    expect(screen.getByRole("button", { name: "Share" })).toBeInTheDocument()
    expect(screen.getByText("Guest Editing")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Edit songs" })).toBeInTheDocument()
  })
})
