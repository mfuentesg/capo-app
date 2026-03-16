# Teams UI Redesign — Design Spec

**Date:** 2026-03-16
**Scope:** Teams list page and team detail page visual redesign. No logic changes.

---

## Overview

Improve the visual design and information hierarchy of the two teams pages:

- `/dashboard/teams` — teams list
- `/dashboard/teams/[id]` — team detail

All existing functionality (switch team, invite member, change role, leave/delete, transfer ownership) is preserved. Only UI layout and styling changes.

---

## Teams List Page (`team-card.tsx`)

### Card layout

Keep the responsive grid (1 → 2 → 3 columns). Each `TeamCard` gets:

**Color-accent bar** — a `h-1` (4px) `div` placed at the very top of the card, full card width, rounded top corners only. This is distinct from the detail page hero banner. Role mapping:
- `owner` → `bg-gradient-to-r from-blue-400 to-purple-400`
- `admin` → `bg-gradient-to-r from-green-400 to-teal-400`
- `member` / `viewer` → `bg-gradient-to-r from-yellow-300 to-orange-300`

These are opaque Tailwind palette values; no `dark:` variants are needed.

**Active team card** gets `border-2 border-primary` replacing the `Card` component's default border. Inactive cards keep the `Card` component's built-in border (1px `border-border`) without any additional class — do not add `border border-border` explicitly.

### Card structure (top to bottom)

The current card uses `<CardHeader>` for icon+name and `<CardContent>` for the badges/stats/actions row. This restructure moves badges up into `<CardHeader>` and keeps stats+actions in `<CardContent>`:

1. **Accent bar** — `<div className="h-1 rounded-t-lg bg-gradient-to-r ..." />` inserted as the first child of `<Card>`, before `<CardHeader>`
2. **`<CardHeader>`** — icon container + team name (truncated, links to detail) + `<Badge variant="default">Active</Badge>` (only when `isCurrentTeam`); then below in a second row: `RoleBadge` + `<Badge variant="secondary">Public</Badge>` (when applicable). The `CardTitle` link and badges row are both inside `<CardHeader>`.
3. **`<CardContent>`** — replaces the current single-row content: divider (`border-t border-border my-2`) + footer row with member count stat on left and action buttons on right. `transition-shadow` on hover is preserved from current code.

The existing `<CardContent>` block is fully replaced — do not keep the current layout inside it.

### Icon container

The icon container is `h-9 w-9` (36px), `rounded-lg`, background and border match role:
- `owner` → `bg-blue-500/10 border border-blue-500/20`
- `admin` → `bg-green-500/10 border border-green-500/20`
- `member` / `viewer` → `bg-yellow-500/10 border border-yellow-500/20`

For **owners** (`isOwner === true`, derived from `user?.id === team.created_by`), render `<IconPicker iconClassName="h-5 w-5" ... />` wrapped in a `<div className="h-9 w-9 rounded-lg flex items-center justify-center {role-color-classes}">`. For **non-owners**, render `<Avatar className="h-9 w-9 rounded-lg border {role-border-class}">` with `<TeamIcon>` fallback.

### Action buttons

- **Active team** (`isCurrentTeam === true`): manage icon (`Wrench`, icon-button) + destructive icon. No switch button.
- **Inactive team**: `<Button size="sm" variant="outline">⇄ Switch</Button>` (labeled) + manage (`Wrench`) icon-button + destructive icon.

The manage (`Wrench`) icon-button is shown to **all roles** — it links to the detail page.

**Destructive icon behavior** — preserve the existing `handleLeaveOrDelete` logic exactly:
- Owner + sole member → show `<Trash2>` icon, clicking opens delete dialog
- Owner + multiple members → show `<LogOut>` icon, clicking redirects to detail page (for transfer)
- Non-owner → show `<LogOut>` icon, clicking opens leave dialog

---

## Team Detail Page

### Files: `team-detail-header.tsx`, `team-detail-client.tsx`, `team-members-section.tsx`

### Hero banner header (`team-detail-header.tsx`)

Replace the flat `flex` header row. Full DOM structure:

```tsx
{/* Back button — above the hero, in normal flow */}
<Button variant="ghost" size="icon" asChild>
  <Link href="/dashboard/teams"><ArrowLeft className="h-4 w-4" /></Link>
</Button>

{/* Hero + floating icon — relative positioning parent */}
<div className="relative">
  {/* Banner: h-16 tall gradient — NOTE: this is the detail page banner, not the card accent bar */}
  <div className="h-16 rounded-t-xl bg-gradient-to-br from-primary/15 to-primary/5 border-b border-primary/20" />
  {/* Floating icon: overflows banner bottom by ~18px */}
  <div className="absolute bottom-[-18px] left-4 h-11 w-11 rounded-xl border-2 border-border bg-background shadow-sm flex items-center justify-center">
    {isOwner
      ? <IconPicker value={editingIcon} onChange={handleIconChange} iconClassName="h-6 w-6" />
      : <Avatar className="h-11 w-11 rounded-xl">...</Avatar>
    }
  </div>
</div>

{/* Info block: mt-7 gives 28px clearance for 18px icon overflow + visual breathing room */}
<div className="mt-7 flex items-start justify-between">
  <div>
    {/* editable name (owner) or h1 (non-owner), text-xl font-bold */}
    {/* text-xs text-muted-foreground creation date */}
    {/* badges row: RoleBadge + Public badge. RoleBadge is not in the public API — import it from "./role-badge" (same as team-members-section.tsx). Also add the current user's role as a prop or derive it from team.created_by comparison. Use the currentUserRole already computed in TeamDetailClient and pass it as a new optional prop roleLabel?: TeamRole. */}
  </div>
  {/* Active badge or Switch button, floated right */}
</div>

{/* Stats strip — immediately below info block */}
<div className="mt-4 grid grid-cols-2 gap-3">
  <div className="bg-card border border-border rounded-lg p-3 flex flex-col gap-0.5">
    <span className="text-lg font-bold text-primary">{memberCount}</span>
    <span className="text-xs text-muted-foreground uppercase tracking-wide">Members</span>
  </div>
  <div className="bg-card border border-border rounded-lg p-3 flex flex-col gap-0.5">
    <span className="text-lg font-bold text-primary">{pendingInviteCount}</span>
    <span className="text-xs text-muted-foreground uppercase tracking-wide">Pending invites</span>
  </div>
</div>
```

`from-primary/15 to-primary/5` uses the `--primary` CSS variable which adapts to light/dark theme automatically — no `dark:` override needed.

### New props on `TeamDetailHeader`

All new props are **optional** so existing call sites and tests compile without modification:

```typescript
interface TeamDetailHeaderProps {
  team: Tables<"teams">
  onUpdate?: (updates: TablesUpdate<"teams">) => void
  isOwner?: boolean
  memberCount?: number                              // default: 0
  pendingInviteCount?: number                      // default: 0
  currentUserRole?: Tables<"team_members">["role"] // default: undefined, for RoleBadge
}
```

`RoleBadge` is imported from `"./role-badge"` (internal path — consistent with `team-members-section.tsx`). It renders only when `currentUserRole` is defined.

### Passing counts from `team-detail-client.tsx`

`resolvedInvitations` comes from `getTeamInvitations()` which already filters `accepted_at IS NULL` at the database level — it contains only unaccepted invitations. Compute counts before the return:

```typescript
const memberCount = resolvedMembers.length
const pendingInviteCount = resolvedInvitations.filter(
  (inv) => inv.expires_at >= new Date().toISOString()
).length
```

Pass to `<TeamDetailHeader memberCount={memberCount} pendingInviteCount={pendingInviteCount} currentUserRole={currentUserRole} ... />`. `currentUserRole` is already computed in `TeamDetailClient`.

The **Switch button** on inactive cards calls the existing `switchToTeam(team.id)` function (same as the current icon-button's `onClick`), just with a labeled button instead.

The `pendingInviteCount` filter intentionally duplicates the `isExpired` check already in `TeamMembersSection` — both derive from the same `resolvedInvitations` array, no shared utility needed.

### Danger zone wrapper (`team-detail-client.tsx`)

`<TeamDangerZone />` is currently a direct child inside the `<div className="mx-auto max-w-4xl space-y-6">` container. Wrap it:

```tsx
<div className="rounded-lg border border-destructive/20 bg-destructive/5 p-1">
  <TeamDangerZone ... />
</div>
```

No changes to `TeamDangerZone` internals.

### Members section (`team-members-section.tsx`)

Current-user `Item` row: add `rounded-md` to the existing `bg-primary/5 border-primary/40` classes so the highlight has rounded corners. Change:

```tsx
// before
className={cn("hover:bg-muted/50", isCurrentUser && "border-primary/40 bg-primary/5")}

// after
className={cn("hover:bg-muted/50", isCurrentUser && "border-primary/40 bg-primary/5 rounded-md")}
```

---

## Out of Scope

- No changes to `CreateTeamForm`, `InviteMemberDialog`, `AcceptInvitationClient`, `TeamsHeader`, `TeamsSearch`, `TeamsEmptyState`, `TeamDangerZone` internals
- No changes to data fetching, React Query hooks, server actions, or database
- No new test files; no new tests required. The new props are optional with `0` defaults so existing tests do not need updating.

---

## Files to Change

| File | Change |
|------|--------|
| `features/teams/components/team-card.tsx` | Color-accent bar (`h-1`), icon container colors, labeled Switch button, card structure |
| `features/teams/components/team-detail-header.tsx` | Hero banner (`h-16`), floating icon, info block, stats strip, new optional `memberCount` + `pendingInviteCount` props |
| `features/teams/components/team-detail-client.tsx` | Compute + pass counts to header; wrap danger zone in styled `div` |
| `features/teams/components/team-members-section.tsx` | Add `rounded-md` to current-user row highlight |

---

## Constraints

- Follow project code style: no semicolons, double quotes, 100-char print width, no trailing commas
- No `transition-all` (ESLint enforced) — use `transition-colors` or `transition-shadow` only
- No `backdrop-blur` on mobile sticky elements
- All changes must pass `pnpm typecheck` and `pnpm lint`
