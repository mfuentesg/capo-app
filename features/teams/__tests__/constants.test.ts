import { KeyRound, User, UserLock, UserSearch } from "lucide-react"
import {
  ALL_ROLES,
  ROLE_HIERARCHY,
  ROLE_ICONS,
  ROLE_LABELS,
  ROLE_PERMISSIONS,
  canChangeRole,
  getAvailableRolesForTarget
} from "../constants"

describe("team role constants", () => {
  it("defines the expected role hierarchy", () => {
    expect(ROLE_HIERARCHY).toEqual({
      viewer: 0,
      member: 1,
      admin: 2,
      owner: 3
    })
  })

  it("defines permissions for each role", () => {
    expect(ROLE_PERMISSIONS.owner.canAssignRoles).toEqual(["admin", "member", "viewer"])
    expect(ROLE_PERMISSIONS.owner.canInvite).toBe(true)
    expect(ROLE_PERMISSIONS.admin.canAssignRoles).toEqual(["member", "viewer"])
    expect(ROLE_PERMISSIONS.member.canAssignRoles).toEqual([])
    expect(ROLE_PERMISSIONS.viewer.canAssignRoles).toEqual([])
    expect(ROLE_PERMISSIONS.viewer.canRemove.cannotRemoveOwner).toBe(true)
  })

  it("changes role only when allowed by assignment and safety rules", () => {
    expect(canChangeRole("owner", "member", "admin")).toBe(true)
    expect(canChangeRole("owner", "owner", "admin")).toBe(false)
    expect(canChangeRole("admin", "member", "owner")).toBe(false)
    expect(canChangeRole("admin", "admin", "member")).toBe(false)
    expect(canChangeRole("member", "viewer", "member")).toBe(false)
  })

  it("returns valid available roles for a given caller and target", () => {
    expect(getAvailableRolesForTarget("owner", "member")).toEqual(["admin", "viewer"])
    expect(getAvailableRolesForTarget("admin", "viewer")).toEqual(["member"])
    expect(getAvailableRolesForTarget("admin", "admin")).toEqual([])
    expect(getAvailableRolesForTarget("viewer", "member")).toEqual([])
  })

  it("exposes all roles, labels, and icons", () => {
    expect(ALL_ROLES).toEqual(["owner", "admin", "member", "viewer"])
    expect(ROLE_LABELS).toEqual({
      owner: "Owner",
      admin: "Admin",
      member: "Member",
      viewer: "Viewer"
    })
    expect(ROLE_ICONS.owner).toBe(UserLock)
    expect(ROLE_ICONS.admin).toBe(KeyRound)
    expect(ROLE_ICONS.member).toBe(User)
    expect(ROLE_ICONS.viewer).toBe(UserSearch)
  })
})
