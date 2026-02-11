---
name: vercel-composition-patterns
description: React composition patterns that scale. Use when refactoring components with boolean prop proliferation or designing flexible component APIs.
trigger-keywords:
  - component
  - composition
  - refactor
  - boolean props
  - compound components
  - prop drilling
scope: repository
requires-user-input: false
estimated-time: "30 minutes"
metadata:
  author: vercel
  version: "1.0.0"
  license: MIT
---

# React Composition Patterns

Composition patterns for building flexible, maintainable React components. Avoid boolean prop proliferation by using compound components, lifting state, and composing internals.

## When to Apply

Reference these guidelines when:

- Refactoring components with many boolean props
- Building reusable component libraries
- Designing flexible component APIs
- Reviewing component architecture
- Working with compound components or context providers

## Rule Categories by Priority

| Priority | Category                | Impact | Prefix        |
| -------- | ----------------------- | ------ | ------------- |
| 1        | Component Architecture  | HIGH   | architecture- |
| 2        | State Management        | MEDIUM | state-        |
| 3        | Implementation Patterns | MEDIUM | patterns-     |
| 4        | React 19 APIs           | MEDIUM | react19-      |

## Quick Reference

### Component Architecture

Avoid boolean props to customize behavior; use composition.

Bad:

```typescript
<Modal isDialog={true} isLoading={false} isDanger={true} />
```

Good:

```typescript
<Modal>
  <Modal.Header>Delete Item</Modal.Header>
  <Modal.Body><Spinner /></Modal.Body>
  <Modal.Footer variant="danger">
    <Button>Delete</Button>
  </Modal.Footer>
</Modal>
```

### State Management

Define generic context interfaces with state and actions.

```typescript
interface MyContextType {
  value: string
  setValue: (v: string) => void
  isLoading: boolean
}
```

### Implementation Patterns

Use explicit variants instead of boolean modes.

Bad:

```typescript
<Card variant="highlight" interactive={true} />
```

Good:

```typescript
<Card.Highlight />
<Card.Interactive />
```

## Resources

- https://vercel.com/design/patterns
- https://react.dev
- https://ui.shadcn.com
