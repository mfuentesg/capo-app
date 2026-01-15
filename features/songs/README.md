# Songs Feature

## Overview

The songs feature manages the song library, providing components, hooks, and utilities for displaying, searching, filtering, and managing songs.

## Public API

### Components

- `SongsClient` - Main container component for song library management
- `SongDetail` - Displays detailed information about a single song
- `SongList` - Renders a list of songs with filtering
- `SongItem` - Individual song item component
- `KeySelect` - Dropdown for selecting musical keys

### Hooks

- `useSongs` - Hook for managing song state and operations

### Contexts

- `NewSongsProvider` - Provider for new songs context
- `useNewSongs` - Hook to access new songs context

### Data

- `mockSongs` - Mock songs data for development
- `getSongById(songId: string)` - Get a single song by ID
- `getSongsByIds(songIds: string[])` - Get multiple songs by their IDs
- `getAllSongs()` - Get all songs

### Types

- `Song` - Song type definition
- `GroupBy` - Grouping options type
- `SongDetailProps` - Props for SongDetail component
- `SongListProps` - Props for SongList component
- `SongsClientProps` - Props for SongsClient component
- `BPMRange` - BPM range type
- `MusicalKey` - Musical key type

## Usage

```typescript
import { SongsClient, useSongs, mockSongs } from "@/features/songs"

// In a page
export default function SongsPage() {
  return <SongsClient initialSongs={mockSongs} />
}

// Using the hook
function MyComponent() {
  const { songs, addSong, updateSong } = useSongs()
  // ...
}
```

## Dependencies

- `@/features/lyrics-editor` - For displaying song lyrics
- `@/features/playlist-draft` - For adding songs to playlists
- `@/lib` - For shared utilities (music theory, constants)

## Internal Structure

```
features/songs/
├── components/       # UI components
├── hooks/           # Custom hooks
├── contexts/        # React contexts
├── types/           # TypeScript types
├── utils/           # Utility functions
├── api/             # API functions
├── data/            # Mock data and fixtures
└── __tests__/       # Tests
```
