---
name: vercel-react-best-practices
description: React and Next.js performance optimization guidelines from Vercel Engineering. Use when writing, reviewing, or optimizing React/Next.js code.
trigger-keywords:
  - performance
  - optimization
  - bundle
  - rendering
  - data fetching
  - waterfalls
  - Suspense
scope: repository
requires-user-input: false
estimated-time: "30-60 minutes"
metadata:
  author: vercel
  version: "1.0.0"
  license: MIT
---

# Vercel React Best Practices

Performance optimization guide for React and Next.js applications.

## When to Apply

Reference these guidelines when:

- Writing new React components or Next.js pages
- Implementing data fetching
- Reviewing performance issues
- Refactoring existing code
- Optimizing bundle size

## Quick Reference

### Eliminating Waterfalls

Move awaits into branches where they are used.

Bad:

```typescript
const user = await getUser()
const posts = await getPosts(user.id)
```

Good:

```typescript
const [user, posts] = await Promise.all([getUser(), getPosts(userId)])
```

### Bundle Size Optimization

Prefer dynamic imports for heavy features.

Bad:

```typescript
import { SongsClient } from "@/features/songs"
```

Good:

```typescript
import dynamic from "next/dynamic"
const SongsClient = dynamic(() => import("@/features/songs").then((m) => m.SongsClient))
```

### Rendering Performance

Use Suspense to stream content.

```typescript
<Suspense fallback={<Skeleton />}>
  <HeavyComponent />
</Suspense>
```

## Commands

```bash
pnpm typecheck
pnpm lint
pnpm build
```

## Resources

- https://vercel.com/design/patterns
- https://nextjs.org/docs
- https://react.dev
