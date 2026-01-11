# Teams Feature

## Overview

The teams feature manages teams, allowing users to create, manage, and collaborate within teams. Teams can be used to organize worship teams, band members, and other collaborative groups.

## Public API

### Components

- `TeamsClient` - Main container component for teams management
- `CreateTeamClient` - Client component for creating new teams
- `CreateTeamForm` - Form component for team creation
- `TeamDetailClient` - Client component for team detail view
- `TeamCard` - Card component for displaying team information
- `TeamForm` - Form component for editing teams

### Hooks

- `useTeams` - Hook for managing teams data
- `useTeamRealtime` - Hook for real-time team updates

### API

- `getTeams()` - Fetch all teams for current user
- `getTeam(teamId: string)` - Get a single team by ID
- `createTeam(team: TeamInsert)` - Create a new team
- `updateTeam(teamId: string, updates: TeamUpdate)` - Update a team
- `getTeamMembers(teamId: string)` - Get team members
- `getTeamInvitations(teamId: string)` - Get team invitations
- `acceptTeamInvitation(token: string)` - Accept a team invitation
- `changeTeamMemberRole(teamId, userId, newRole)` - Change member role
- `transferTeamOwnership(teamId, newOwnerId)` - Transfer ownership

### Data

- `mockTeams` - Mock teams data for development

### Types

All types are exported from `@/features/teams/types`

## Usage

```typescript
import { 
  TeamsClient, 
  useTeams,
  getTeams,
  createTeam 
} from "@/features/teams"

// Using the component
export default function TeamsPage() {
  return <TeamsClient />
}

// Using the hook
function MyComponent() {
  const { teams, isLoading, error } = useTeams()
  // ...
}

// Using the API directly
const teams = await getTeams()
const newTeam = await createTeam({
  name: "My Team",
  description: "Team description"
})
```

## Dependencies

- `@/lib/supabase` - For database operations
- `@/features/auth` - For authentication and user context

## Internal Structure

```
features/teams/
├── components/       # UI components
├── hooks/           # Custom hooks
├── types/           # TypeScript types
├── api/             # API functions (Supabase queries)
└── data/            # Mock data for development
```
