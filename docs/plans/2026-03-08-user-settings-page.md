# User Settings Page — Implementation Plan

**Date:** 2026-03-08
**GitHub Issue:** #42
**Status:** Pending

## Problem

User preferences (dark mode, language) are scattered in the app header as individual controls. There's no dedicated place for account management or to delete an account. This plan consolidates everything into a `/dashboard/settings` page and removes the clutter from the header.

## Approach

Create a new `settings` feature route at `/dashboard/settings`. Move theme and language controls there. Add a "Danger Zone" section with account deletion (calls Supabase `auth.admin.deleteUser` or a soft-delete via a server action). Keep the header lean — retain only a user avatar/menu linking to settings and sign-out.

---

### Task 1: Create the settings page route

**Files:**
- Create: `app/dashboard/settings/page.tsx`
- Create: `app/dashboard/settings/settings-client.tsx`

```tsx
// app/dashboard/settings/page.tsx
import { SettingsClient } from "./settings-client"

export const metadata = { title: "Settings" }

export default function SettingsPage() {
  return <SettingsClient />
}
```

```tsx
// app/dashboard/settings/settings-client.tsx
"use client"

import { ThemeSettings } from "@/features/settings/components/theme-settings"
import { LanguageSettings } from "@/features/settings/components/language-settings"
import { AccountDangerZone } from "@/features/settings/components/account-danger-zone"

export function SettingsClient() {
  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-8">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <ThemeSettings />
      <LanguageSettings />
      <AccountDangerZone />
    </div>
  )
}
```

---

### Task 2: Refactor theme and language into standalone setting sections

**Files:**
- Create: `features/settings/components/theme-settings.tsx`
- Create: `features/settings/components/language-settings.tsx`

Each component renders a card-like section with a title, description, and the existing control (theme toggle / `LanguageSwitcher`). Extract from wherever they currently live in the header.

---

### Task 3: Add `AccountDangerZone` component + delete account server action

**Files:**
- Create: `features/settings/components/account-danger-zone.tsx`
- Create: `features/settings/api/actions.ts` (or modify existing)

**Server action:**

```typescript
// features/settings/api/actions.ts
"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function deleteAccountAction(): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  // Delete user data first (songs, playlists, settings, team memberships)
  // Supabase RLS + CASCADE should handle most of this via DB constraints.
  // Then delete the auth user.
  const { error } = await supabase.rpc("delete_user_account", { p_user_id: user.id })
  if (error) throw error

  await supabase.auth.signOut()
  redirect("/login")
}
```

**DB migration needed:** Create a `delete_user_account(p_user_id uuid)` PL/pgSQL function that deletes user rows from all tables (songs, playlists, user_song_settings, user_preferences, team_members) and then calls `auth.users` deletion or marks user as deleted.

**UI component:**

```tsx
// features/settings/components/account-danger-zone.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { deleteAccountAction } from "../api/actions"

export function AccountDangerZone() {
  const [confirming, setConfirming] = useState(false)
  const [pending, setPending] = useState(false)

  const handleDelete = async () => {
    setPending(true)
    try {
      await deleteAccountAction()
    } catch {
      setPending(false)
      setConfirming(false)
    }
  }

  return (
    <section className="border border-destructive rounded-lg p-6 space-y-4">
      <h2 className="text-lg font-semibold text-destructive">Danger Zone</h2>
      <p className="text-sm text-muted-foreground">
        Permanently delete your account and all associated data. This cannot be undone.
      </p>
      {!confirming ? (
        <Button variant="destructive" onClick={() => setConfirming(true)}>
          Delete account
        </Button>
      ) : (
        <div className="space-y-2">
          <p className="text-sm font-medium">Are you sure? This is irreversible.</p>
          <div className="flex gap-2">
            <Button variant="destructive" disabled={pending} onClick={handleDelete}>
              {pending ? "Deleting…" : "Yes, delete my account"}
            </Button>
            <Button variant="ghost" onClick={() => setConfirming(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </section>
  )
}
```

---

### Task 4: Add settings link to header/nav

**Files:**
- Modify: the dashboard sidebar/header component (locate the nav component)

Add a "Settings" link pointing to `/dashboard/settings`.

---

### Task 5: Remove theme/language controls from header

Once the settings page is live, remove the inline theme and language switcher from wherever they appear in the header. Keep only the user avatar menu with links to Settings and Sign out.

---

### Task 6: Add DB migration for `delete_user_account`

```bash
pnpm supabase migration new "add_delete_user_account_function"
```

Write the SQL:

```sql
CREATE OR REPLACE FUNCTION public.delete_user_account(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Cascade deletes via FK should handle child rows.
  -- Explicitly clean up anything not covered by FK cascade:
  DELETE FROM public.user_song_settings WHERE user_id = p_user_id;
  DELETE FROM public.user_preferences WHERE user_id = p_user_id;
  DELETE FROM public.team_members WHERE user_id = p_user_id;
  DELETE FROM public.songs WHERE user_id = p_user_id;
  DELETE FROM public.playlists WHERE user_id = p_user_id;
  -- Delete the auth user (requires service role in a real prod migration)
  DELETE FROM auth.users WHERE id = p_user_id;
END;
$$;
```

Apply:
```bash
pnpm supabase migration up --local
pnpm types:generate
```

---

### Task 7: i18n + tests

Add translation keys for all new UI strings. Write unit tests for `deleteAccountAction` (mock supabase, verify it calls the RPC and redirects).

---

### Verification

```bash
pnpm lint && pnpm typecheck && pnpm test
```
