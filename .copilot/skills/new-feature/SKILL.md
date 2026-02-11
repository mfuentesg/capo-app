---
name: new-feature
description: Scaffold a new feature module following Feature-Based Architecture patterns for capo-app
trigger-keywords:
  - new feature
  - scaffold
  - feature creation
  - module
  - feature module
scope: repository
requires-user-input: true
estimated-time: "20-30 minutes"
related-skills:
  - fba-compliance
metadata:
  author: development-team
  version: "1.0.0"
  project: capo-app
---

# Create New Feature Module

Scaffold a new feature following the project's Feature-Based Architecture (FBA) patterns.

## Directory Structure

Create the following structure in `features/{{name}}/`:

```
features/{{name}}/
├── index.ts
├── components/
│   ├── index.ts
│   └── [component-name]/
│       └── [component-name].tsx
├── hooks/
│   ├── index.ts
│   └── [hook-name].ts
├── types/
│   ├── index.ts
│   └── [types-name].ts
├── api/
│   ├── index.ts
│   └── actions.ts
├── contexts/
│   ├── index.ts
│   └── [context-name].tsx
└── __tests__/
    ├── fixtures/
    │   └── [feature].fixtures.ts
    └── [test-files].test.ts
```

## File Templates

### `features/{{name}}/index.ts`

```typescript
export * from "./components"
export * from "./hooks"
export type * from "./types"
// export * from "./api"  // Use only when needed externally
```

### `features/{{name}}/types/index.ts`

```typescript
export interface {{PascalName}} {
  id: string
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
```

### `features/{{name}}/hooks/index.ts`

```typescript
export { use{{PascalName}} } from "./use-{{name}}"
export { use{{PascalName}}s } from "./use-{{name}}s"
```

## FBA Import Rules

Use the public API for imports:

```typescript
import { {{PascalName}}List, use{{PascalName}} } from "@/features/{{name}}"
```

Avoid subpath imports:

```typescript
// Avoid
import { {{PascalName}}List } from "@/features/{{name}}/internal"
```

## Checklist

- Create directory structure in `features/{{name}}/`
- Add `index.ts` public API file to root
- Create subdirectory barrel exports
- Define types in `types/index.ts`
- Create initial hooks in `hooks/`
- Create sample component(s) in `components/`
- Add `__tests__/` directory with fixtures
- Update feature's root `index.ts` with all exports
- Run `pnpm typecheck`

## Example: Creating a "notifications" Feature

### Step 1: Create Structure

```bash
mkdir -p features/notifications/{components,hooks,types,api,contexts,__tests__/fixtures}
touch features/notifications/index.ts
touch features/notifications/types/index.ts
touch features/notifications/components/index.ts
touch features/notifications/hooks/index.ts
touch features/notifications/api/index.ts
```

### Step 2: Define Types

```typescript
export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  read: boolean
  createdAt: Date
  updatedAt: Date
}
```

### Step 3: Create Hook

```typescript
import { useQuery } from "@tanstack/react-query"
import { api } from "../api"

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: () => api.getNotifications()
  })
}
```

### Step 4: Create Component

```typescript
import type { Notification } from "../../types"

export interface NotificationCardProps {
  notification: Notification
}

export function NotificationCard({ notification }: NotificationCardProps) {
  return <div>{notification.title}: {notification.message}</div>
}
```

### Step 5: Export Everything

```typescript
export * from "./components"
export * from "./hooks"
export type * from "./types"
export { api } from "./api"
```
