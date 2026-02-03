# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Capo is a song library app for musicians, built with Next.js 16 and Supabase. It uses the ChordPro format for chord notation.

## Commands

```bash
# Development
pnpm dev                    # Start dev server (runs env validation first)
pnpm supabase start         # Start local Supabase services

# Code Quality
pnpm lint                   # ESLint (zero warnings allowed)
pnpm lint:fix               # ESLint with auto-fix
pnpm typecheck              # TypeScript type checking
pnpm test                   # Run Jest tests
pnpm test:watch             # Jest in watch mode
pnpm test -- path/to/file   # Run single test file

# Build & CI
pnpm build                  # Production build
pnpm ci                     # Full CI pipeline (lint + typecheck + build)

# Utilities
pnpm types:generate         # Regenerate Supabase TypeScript types
pnpm i18n:validate          # Validate translation files
```

## Architecture

This project uses **Feature-Based Architecture (FBA)** - code is organized by business domain, not technical layer. See `features/docs/FBA_GUIDE.md` for the complete guide.

### Directory Structure

```
features/           # Self-contained feature modules
├── songs/          # Song library management
├── playlists/      # Playlist management
├── playlist-draft/ # Quick add-to-playlist cart
├── lyrics-editor/  # Lyrics display and formatting
├── auth/           # Authentication logic
├── teams/          # Team/workspace management
├── settings/       # User preferences
└── [feature]/
    ├── components/
    ├── hooks/
    ├── contexts/
    ├── types/
    ├── api/
    └── index.ts    # PUBLIC API - all exports go here

app/                # Next.js routes and layouts
lib/                # Shared utilities (supabase, i18n, actions)
components/ui/      # shadcn/ui components
```

### FBA Import Rules

```typescript
// CORRECT - import via public API
import { SongsClient } from "@/features/songs"
import { usePlaylistDraft } from "@/features/playlist-draft"

// WRONG - never import from internal paths
import { SongsClient } from "@/features/songs/components/songs-client"
```

When adding code to a feature:
1. Create the file in the appropriate subdirectory
2. Export from that subdirectory's `index.ts`
3. Re-export from the feature's root `index.ts`

## Code Style

- **TypeScript**: Strict mode with no `any` types (enforced by ESLint)
- **Formatting**: Prettier with double quotes, no semicolons, no trailing commas
- **Components**: React Server Components by default, `'use client'` only when needed
- **State**: React Query for server state, React Context for client state
- **Validation**: Zod schemas for runtime validation
- **UI Components**: shadcn/ui (new-york style) with Radix primitives

## Testing

Tests live in `__tests__/` directories within each feature. Use fixtures for mock data:

```typescript
// features/songs/__tests__/fixtures/songs.fixtures.ts
export const mockSongs: Song[] = [...]
export function createMockSong(overrides?: Partial<Song>): Song { ... }
```

## Database

- Local development uses Supabase CLI (`pnpm supabase start`)
- Types are generated from local DB schema (`pnpm types:generate`)
- Migrations stored in `supabase/migrations/`
- Browser client: `lib/supabase/client.ts`
- Server client: `lib/supabase/server.ts`
