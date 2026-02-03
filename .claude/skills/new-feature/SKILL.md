---
name: new-feature
description: Scaffold a new feature module following Feature-Based Architecture patterns
disable-model-invocation: true
arguments:
  - name: name
    description: Feature name in kebab-case (e.g., "notifications", "user-preferences")
    required: true
---

# Create New Feature Module

Scaffold a new feature following the project's Feature-Based Architecture (FBA) patterns.

## Directory Structure

Create the following structure in `features/{{name}}/`:

```
features/{{name}}/
├── index.ts           # Public API - ALL exports go here
├── components/
│   └── index.ts       # Component barrel exports
├── hooks/
│   └── index.ts       # Hook barrel exports
├── types/
│   └── index.ts       # Type definitions
├── api/
│   └── index.ts       # API layer (Supabase queries)
└── contexts/          # Optional - only if feature needs local state
    └── index.ts
```

## File Templates

### `features/{{name}}/index.ts` (Public API)

```typescript
// Components
export * from "./components"

// Hooks
export * from "./hooks"

// Types
export * from "./types"

// API (if needed externally)
// export * from "./api"
```

### `features/{{name}}/types/index.ts`

```typescript
export interface {{PascalName}} {
  id: string
  // Add fields based on requirements
  createdAt: Date
  updatedAt: Date
}

export interface {{PascalName}}FormData {
  // Form input types
}
```

### `features/{{name}}/components/index.ts`

```typescript
export { {{PascalName}}List } from "./{{name}}-list"
export { {{PascalName}}Card } from "./{{name}}-card"
// Add more component exports as created
```

### `features/{{name}}/hooks/index.ts`

```typescript
export { use{{PascalName}} } from "./use-{{name}}"
export { use{{PascalName}}s } from "./use-{{name}}s"
// Add more hook exports as created
```

## FBA Import Rules

After creating the feature, import from it using the public API only:

```typescript
// CORRECT
import { {{PascalName}}List, use{{PascalName}} } from "@/features/{{name}}"

// WRONG - never import from internal paths
import { {{PascalName}}List } from "@/features/{{name}}/components/{{name}}-list"
```

## Checklist

- [ ] Create directory structure
- [ ] Add `index.ts` public API file
- [ ] Create subdirectory barrel exports (`components/index.ts`, etc.)
- [ ] Define types in `types/index.ts`
- [ ] Follow existing feature patterns (reference `features/songs` or `features/playlists`)
- [ ] Use React Server Components by default, add `'use client'` only when needed
- [ ] See `features/docs/FBA_GUIDE.md` for complete guidelines
