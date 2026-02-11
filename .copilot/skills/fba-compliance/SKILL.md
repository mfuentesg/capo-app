---
name: fba-compliance
description: Feature-Based Architecture compliance checker and violation fixer for capo-app
trigger-keywords:
  - FBA
  - feature-based
  - architecture
  - import
  - public API
  - index.ts
  - barrel export
scope: repository
requires-user-input: false
estimated-time: "varies by task"
related-skills:
  - new-feature
metadata:
  author: development-team
  version: "1.0.0"
  license: MIT
  project: capo-app
---

# FBA Compliance Guide for Copilot

Capo uses Feature-Based Architecture (FBA). This skill helps maintain compliance and identify violations.

## The 3 Core Rules

1. Import via public API.
2. Avoid subpath imports inside a feature.
3. Export public APIs from the feature root `index.ts`.

### Public API Import

```typescript
import { SongsClient, useSongs } from "@/features/songs"
import { usePlaylistDraft } from "@/features/playlist-draft"
```

### Avoid Subpath Imports

```typescript
// Avoid
import { SongsClient } from "@/features/songs/internal"
```

### Root Index Exports

```typescript
// features/songs/index.ts
export { SongsClient, SongDetail } from "./components"
export { useSongs } from "./hooks"
export type { Song } from "./types"
```

## Feature Structure

```
features/[feature-name]/
├── index.ts
├── components/
│   ├── index.ts
│   └── component-name.tsx
├── hooks/
│   ├── index.ts
│   └── use-hook.ts
├── types/
│   ├── index.ts
│   └── types.ts
├── api/
│   ├── index.ts
│   └── actions.ts
├── contexts/
│   ├── index.ts
│   └── context.tsx
└── __tests__/
```

## How to Fix

### Internal Import Example

Before:

```typescript
import { SongItem } from "@/features/songs/internal"
```

After:

```typescript
import { SongItem } from "@/features/songs"
```

### Missing Barrel Export

Create `features/songs/components/index.ts`:

```typescript
export { SongsClient } from "./songs-client"
export { SongDetail } from "./song-detail"
export { SongList } from "./song-list"
export { SongItem } from "./song-item"
export { KeySelect } from "./key-select"
```

Update `features/songs/index.ts`:

```typescript
export * from "./components"
```

## Validation Commands

```bash
# Check for subpath imports in features
rg "@/features/[^\"']+/" --glob "*.ts" --glob "*.tsx"

# Verify index.ts files exist
find features -name "index.ts" -type f -exec echo "=== {} ===" \; -exec head -5 {} \;

# Type checking
pnpm typecheck
```

## Resources

- [features/docs/FBA_GUIDE.md](../../features/docs/FBA_GUIDE.md)
- [COMPLIANCE_REVIEW.md](../../COMPLIANCE_REVIEW.md)
- [CLAUDE.md](../../CLAUDE.md)
