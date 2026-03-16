import { songsKeys } from "../query-keys"

describe("songsKeys", () => {
  it("lists returns base list key", () => {
    expect(songsKeys.lists()).toEqual(["songs", "list"])
  })

  it("list returns key scoped to context", () => {
    const context = { type: "personal" as const, userId: "u1" }
    expect(songsKeys.list(context)).toEqual(["songs", "list", context])
  })

  it("listAll returns key scoped to userId", () => {
    expect(songsKeys.listAll("u1")).toEqual(["songs", "list", "all", "u1"])
  })

  it("details returns base detail key", () => {
    expect(songsKeys.details()).toEqual(["songs", "detail"])
  })

  it("detail returns key scoped to song id", () => {
    expect(songsKeys.detail("s1")).toEqual(["songs", "detail", "s1"])
  })

  it("allUserSettings returns all user-settings key", () => {
    expect(songsKeys.allUserSettings()).toEqual(["songs", "user-settings", "all"])
  })

  it("userSettings returns key scoped to song id", () => {
    expect(songsKeys.userSettings("s1")).toEqual(["songs", "detail", "s1", "user-settings"])
  })

  it("userPreferences returns user-preferences key", () => {
    expect(songsKeys.userPreferences()).toEqual(["songs", "user-preferences"])
  })
})
