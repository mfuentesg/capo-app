# Playlists Feature

## Overview

The playlists feature manages playlists, allowing users to create, edit, organize, and share playlists of songs.

## Public API

### Components

- `PlaylistsClient` - Main container component for playlist management
- `PlaylistDetail` - Displays detailed information about a single playlist
- `PlaylistList` - Renders a list of playlists
- `PlaylistItem` - Individual playlist item component
- `PlaylistSongItem` - Component for songs within a playlist

### Contexts & Hooks

- `PlaylistsProvider` - Provider for playlists context
- `usePlaylists` - Hook to access and manage playlists

### Utils

- `DraggablePlaylist` - Component for drag-and-drop playlist reordering

### Types

- `Playlist` - Playlist type definition
- `PlaylistWithSongs` - Playlist with songs populated
- `PlaylistDetailProps` - Props for PlaylistDetail component
- `PlaylistListProps` - Props for PlaylistList component

## Usage

```typescript
import {
  PlaylistsClient,
  PlaylistDetail,
  usePlaylists,
  PlaylistsProvider
} from "@/features/playlists"

// Wrap your app with the provider
<PlaylistsProvider>
  <PlaylistsClient />
</PlaylistsProvider>

// Using the hook
function MyComponent() {
  const { playlists, addPlaylist, updatePlaylist } = usePlaylists()
  // ...
}
```

## Dependencies

- `@/features/songs` - For song data and types
- `@/features/playlist-draft` - For adding songs to playlists
- `@/features/playlist-sharing` - For sharing functionality
- `@/features/settings` - For locale settings

## Internal Structure

```
features/playlists/
├── components/       # UI components
├── contexts/         # React contexts
├── types/            # TypeScript types
├── utils/            # Utility functions (draggable playlist)
├── api/              # API functions
└── __tests__/        # Tests
```
