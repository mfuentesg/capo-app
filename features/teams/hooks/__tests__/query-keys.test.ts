import { teamsKeys } from "../query-keys"

describe("teamsKeys", () => {
  it("lists returns base list key", () => {
    expect(teamsKeys.lists()).toEqual(["teams", "list"])
  })

  it("list returns the list key", () => {
    expect(teamsKeys.list()).toEqual(["teams", "list"])
  })

  it("details returns base detail key", () => {
    expect(teamsKeys.details()).toEqual(["teams", "detail"])
  })

  it("detail returns key scoped to team id", () => {
    expect(teamsKeys.detail("t1")).toEqual(["teams", "detail", "t1"])
  })

  it("members returns key scoped to teamId", () => {
    expect(teamsKeys.members("t1")).toEqual(["teams", "detail", "t1", "members"])
  })

  it("invitations returns key scoped to teamId", () => {
    expect(teamsKeys.invitations("t1")).toEqual(["teams", "detail", "t1", "invitations"])
  })

  it("pendingInvitations returns pending-invitations key", () => {
    expect(teamsKeys.pendingInvitations()).toEqual(["teams", "pending-invitations"])
  })
})
