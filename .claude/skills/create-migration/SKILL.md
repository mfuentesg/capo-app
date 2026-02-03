---
name: create-migration
description: Create a new Supabase database migration with proper naming and validation workflow
disable-model-invocation: true
arguments:
  - name: name
    description: Migration name in snake_case (e.g., "add_user_preferences_table")
    required: true
---

# Create Supabase Migration

Create a new database migration for the Supabase project.

## Steps

1. **Create the migration file**:
   ```bash
   pnpm supabase migration new {{name}}
   ```

2. **Edit the generated SQL file** in `supabase/migrations/` with the required schema changes

3. **Validate locally** by resetting the database:
   ```bash
   pnpm supabase db reset
   ```

4. **Regenerate TypeScript types** after the migration is applied:
   ```bash
   pnpm types:generate
   ```

## Migration Guidelines

- Use snake_case for table and column names
- Always include `created_at` and `updated_at` timestamps for new tables
- Add appropriate indexes for frequently queried columns
- Include RLS (Row Level Security) policies for new tables
- Reference existing patterns in `supabase/migrations/` for consistency

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
