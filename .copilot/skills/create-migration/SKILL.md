---
name: create-migration
description: Create a new Supabase database migration with proper naming and validation workflow
trigger-keywords:
  - migration
  - database schema
  - supabase
  - schema change
scope: repository
requires-user-input: true
estimated-time: "10-15 minutes"
metadata:
  author: development-team
  version: "1.0.0"
  project: capo-app
---

# Create Supabase Migration

Create a new database migration for the Supabase project for capo-app.

## Steps

1. Create the migration file:

   ```bash
   pnpm supabase migration new {{name}}
   ```

2. Edit the generated SQL file in `supabase/migrations/` with the required schema changes.

3. Validate locally by resetting the database:

   ```bash
   pnpm supabase db reset
   ```

4. Regenerate TypeScript types after the migration is applied:
   ```bash
   pnpm types:generate
   ```

## Migration Guidelines

- Use snake_case for table and column names.
- Always include `created_at` and `updated_at` timestamps for new tables.
- Add appropriate indexes for frequently queried columns.
- Include RLS policies for new tables.
- Reference existing patterns in `supabase/migrations/` for consistency.

## Example Migration

```sql
-- Create user_preferences table
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'system',
  notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Users can only access their own preferences
CREATE POLICY "Users can manage their own preferences"
  ON user_preferences
  FOR ALL
  USING (auth.uid() = user_id);

-- Index for fast user lookups
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
```

## Migration Naming

Use descriptive names in `snake_case`:

- OK: `add_user_preferences_table`
- OK: `add_team_members_table`
- OK: `add_rls_policies_for_songs`
- OK: `create_playlist_collaborators_table`
- Avoid: `migration1`
- Avoid: `fix`
- Avoid: `schema_update`

## After Migration

1. Verify types are generated:

   ```bash
   ls lib/supabase/generated/
   ```

2. Update any TypeScript types if needed:

   ```bash
   cat lib/supabase/generated/database.types.ts
   ```

3. Create any required hooks or API functions in relevant feature folders.

4. Test locally:
   ```bash
   pnpm dev
   pnpm test
   ```
