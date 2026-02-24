import { render, screen } from "@testing-library/react"
import type { ReactNode } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { PlaylistShareView } from "../playlist-share-view"
import { LocaleProvider } from "@/features/settings"
import type { PlaylistWithSongs } from "@/features/playlists/types"

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={href}>{children}</a>
  )
}))

jest.mock("@/features/playlists/api/actions", () => ({
  reorderPlaylistSongsAction: jest.fn().mockResolvedValue(undefined)
}))

jest.mock("@/features/auth", () => ({
  useUser: () => ({ data: null })
}))

jest.mock("@hello-pangea/dnd", () => ({
  DragDropContext: ({ children }: { children: ReactNode }) => <>{children}</>,
  Droppable: ({
    children
  }: {
    children: (provided: object, snapshot: object) => ReactNode
  }) => <>{children({ innerRef: jest.fn(), droppableProps: {}, placeholder: null }, {})}</>,
  Draggable: ({
    children
  }: {
    children: (provided: object, snapshot: object) => ReactNode
  }) =>
    <>{children({ innerRef: jest.fn(), draggableProps: {}, dragHandleProps: {} }, { isDragging: false })}</>
}))

function renderWithProviders(ui: ReactNode) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <LocaleProvider>{ui}</LocaleProvider>
    </QueryClientProvider>
  )
}

const viewOnlyPlaylist: PlaylistWithSongs = {
  id: "playlist-public-1",
  name: "Shared Set",
  description: "Server sorted playlist",
  songs: [
    { id: "song-2", title: "Second Song", artist: "Artist B", key: "G", bpm: 108 },
    { id: "song-1", title: "First Song", artist: "Artist A", key: "C", bpm: 96 }
  ],
  createdAt: "2026-02-01T00:00:00.000Z",
  updatedAt: "2026-02-01T00:00:00.000Z",
  visibility: "public",
  allowGuestEditing: false,
  shareCode: "share-code-123"
}

const guestEditingPlaylist: PlaylistWithSongs = {
  ...viewOnlyPlaylist,
  allowGuestEditing: true
}

describe("PlaylistShareView", () => {
  it("renders songs in server-provided order for view-only playlist", () => {
    renderWithProviders(<PlaylistShareView playlist={viewOnlyPlaylist} />)

    const songButtons = screen.getAllByRole("button", { name: /Song/ })
    expect(songButtons.map((btn) => btn.getAttribute("aria-label"))).toEqual([
      "Second Song Artist B",
      "First Song Artist A"
    ])
  })

  it("renders share button when shareCode is present", () => {
    renderWithProviders(<PlaylistShareView playlist={viewOnlyPlaylist} />)

    expect(screen.getByRole("button", { name: "Share" })).toBeInTheDocument()
  })

  it("shows Guest Editing badge when allowGuestEditing is true", () => {
    renderWithProviders(<PlaylistShareView playlist={guestEditingPlaylist} />)

    expect(screen.getByText("Guest Editing")).toBeInTheDocument()
  })

  it("renders songs with draggable layout when guest editing is enabled", () => {
    renderWithProviders(<PlaylistShareView playlist={guestEditingPlaylist} />)

    expect(screen.getByText("Second Song")).toBeInTheDocument()
    expect(screen.getByText("First Song")).toBeInTheDocument()
  })
})
