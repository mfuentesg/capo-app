/**
 * Team Member Roles & Permissions
 *
 * This is the single source of truth for all role-based permissions.
 * Used by UI, validation, and documentation generation.
 */

import type { Tables } from "@/lib/supabase/database.types"
import type { LucideIcon } from "lucide-react"
import { KeyRound, User, UserLock, UserSearch } from "lucide-react"

export type TeamRole = Tables<"team_members">["role"]

/**
 * Role hierarchy: higher index = higher privilege
 */
export const ROLE_HIERARCHY: Record<TeamRole, number> = {
  viewer: 0,
  member: 1,
  admin: 2,
  owner: 3
}

/**
 * Comprehensive permission matrix
 *
 * Defines what each role can do and what roles they can assign
 */
export const ROLE_PERMISSIONS: Record<
  TeamRole,
  {
    /** What roles this caller can assign to others */
    canAssignRoles: TeamRole[]
    /** Can invite new members */
    canInvite: boolean
    /** Can remove members */
    canRemove: {
      /** Can remove roles at or below this level */
      canRemoveRoles: TeamRole[]
      /** Cannot remove themselves or owner */
      cannotRemoveSelf: true
      cannotRemoveOwner: true
    }
    /** Can change their own role (never true for now) */
    canChangeOwnRole: boolean
  }
> = {
  owner: {
    canAssignRoles: ["admin", "member", "viewer"],
    canInvite: true,
    canRemove: {
      canRemoveRoles: ["admin", "member", "viewer"],
      cannotRemoveSelf: true,
      cannotRemoveOwner: true
    },
    canChangeOwnRole: false
  },
  admin: {
    canAssignRoles: ["member", "viewer"],
    canInvite: true,
    canRemove: {
      canRemoveRoles: ["member", "viewer"],
      cannotRemoveSelf: true,
      cannotRemoveOwner: true
    },
    canChangeOwnRole: false
  },
  member: {
    canAssignRoles: [],
    canInvite: false,
    canRemove: {
      canRemoveRoles: [],
      cannotRemoveSelf: true,
      cannotRemoveOwner: true
    },
    canChangeOwnRole: false
  },
  viewer: {
    canAssignRoles: [],
    canInvite: false,
    canRemove: {
      canRemoveRoles: [],
      cannotRemoveSelf: true,
      cannotRemoveOwner: true
    },
    canChangeOwnRole: false
  }
}

/**
 * Determines if a caller can change a target user's role
 *
 * @param callerRole - The role of the user attempting the change
 * @param targetRole - The current role of the target user
 * @param newRole - The role to assign
 * @returns true if the change is allowed
 */
export function canChangeRole(
  callerRole: TeamRole,
  targetRole: TeamRole,
  newRole: TeamRole
): boolean {
  const permissions = ROLE_PERMISSIONS[callerRole]

  // Cannot change if not in allowed roles
  if (!permissions.canAssignRoles.includes(newRole)) {
    return false
  }

  // Cannot demote owner
  if (targetRole === "owner" && newRole !== "owner") {
    return false
  }

  // Cannot promote to role higher than caller (except owner promoting owner)
  if (newRole === "owner" && callerRole !== "owner") {
    return false
  }

  // Admin cannot change other admin's role
  if (callerRole === "admin" && targetRole === "admin") {
    return false
  }

  return true
}

/**
 * Get available roles for a caller to assign to a target
 *
 * @param callerRole - The role of the user making the change
 * @param targetRole - The current role of the target user
 * @returns Array of roles the caller can assign
 */
export function getAvailableRolesForTarget(callerRole: TeamRole, targetRole: TeamRole): TeamRole[] {
  const permissions = ROLE_PERMISSIONS[callerRole]

  return permissions.canAssignRoles.filter(
    (role) => canChangeRole(callerRole, targetRole, role) && role !== targetRole
  )
}

/**
 * All available roles
 */
export const ALL_ROLES: TeamRole[] = ["owner", "admin", "member", "viewer"]

/**
 * Role labels for UI
 */
export const ROLE_LABELS: Record<TeamRole, string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Member",
  viewer: "Viewer"
}

export const ROLE_ICONS: Record<TeamRole, LucideIcon> = {
  owner: UserLock,
  admin: KeyRound,
  member: User,
  viewer: UserSearch
}
