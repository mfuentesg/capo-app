import { renderHook, act } from "@testing-library/react"
import { useUnsavedChangesGuard } from "../use-unsaved-changes-guard"

describe("useUnsavedChangesGuard", () => {
  let addEventSpy: jest.SpyInstance
  let removeEventSpy: jest.SpyInstance
  let pushStateSpy: jest.SpyInstance

  beforeEach(() => {
    addEventSpy = jest.spyOn(window, "addEventListener")
    removeEventSpy = jest.spyOn(window, "removeEventListener")
    pushStateSpy = jest.spyOn(window.history, "pushState").mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it("does not register event listeners when not dirty", () => {
    renderHook(() => useUnsavedChangesGuard(false, { onDiscard: jest.fn() }))
    expect(addEventSpy).not.toHaveBeenCalledWith("beforeunload", expect.any(Function))
    expect(addEventSpy).not.toHaveBeenCalledWith("popstate", expect.any(Function))
  })

  it("registers beforeunload and popstate listeners when dirty", () => {
    renderHook(() => useUnsavedChangesGuard(true, { onDiscard: jest.fn() }))
    expect(addEventSpy).toHaveBeenCalledWith("beforeunload", expect.any(Function))
    expect(addEventSpy).toHaveBeenCalledWith("popstate", expect.any(Function))
    expect(pushStateSpy).toHaveBeenCalledWith(null, "", window.location.href)
  })

  it("removes listeners on cleanup when dirty becomes false", () => {
    const { rerender } = renderHook(
      ({ dirty }: { dirty: boolean }) =>
        useUnsavedChangesGuard(dirty, { onDiscard: jest.fn() }),
      { initialProps: { dirty: true } }
    )
    rerender({ dirty: false })
    expect(removeEventSpy).toHaveBeenCalledWith("beforeunload", expect.any(Function))
    expect(removeEventSpy).toHaveBeenCalledWith("popstate", expect.any(Function))
  })

  it("triggerClose shows prompt when dirty", () => {
    const { result } = renderHook(() =>
      useUnsavedChangesGuard(true, { onDiscard: jest.fn() })
    )
    act(() => { result.current.triggerClose() })
    expect(result.current.showPrompt).toBe(true)
  })

  it("triggerClose calls onDiscard immediately when not dirty", () => {
    const onDiscard = jest.fn()
    const { result } = renderHook(() =>
      useUnsavedChangesGuard(false, { onDiscard })
    )
    act(() => { result.current.triggerClose() })
    expect(result.current.showPrompt).toBe(false)
    expect(onDiscard).toHaveBeenCalledTimes(1)
  })

  it("confirmDiscard hides prompt and calls onDiscard", () => {
    const onDiscard = jest.fn()
    const { result } = renderHook(() =>
      useUnsavedChangesGuard(true, { onDiscard })
    )
    act(() => { result.current.triggerClose() })
    expect(result.current.showPrompt).toBe(true)
    act(() => { result.current.confirmDiscard() })
    expect(result.current.showPrompt).toBe(false)
    expect(onDiscard).toHaveBeenCalledTimes(1)
  })

  it("keepEditing hides prompt without calling onDiscard", () => {
    const onDiscard = jest.fn()
    const { result } = renderHook(() =>
      useUnsavedChangesGuard(true, { onDiscard })
    )
    act(() => { result.current.triggerClose() })
    act(() => { result.current.keepEditing() })
    expect(result.current.showPrompt).toBe(false)
    expect(onDiscard).not.toHaveBeenCalled()
  })

  it("popstate handler shows prompt and re-pushes history when dirty", () => {
    const { result } = renderHook(() => useUnsavedChangesGuard(true, { onDiscard: jest.fn() }))
    act(() => { window.dispatchEvent(new PopStateEvent("popstate")) })
    expect(pushStateSpy).toHaveBeenCalledTimes(2) // once on mount, once on popstate
    expect(result.current.showPrompt).toBe(true)
  })

  it("removes listeners on unmount while dirty", () => {
    const { unmount } = renderHook(() =>
      useUnsavedChangesGuard(true, { onDiscard: jest.fn() })
    )
    unmount()
    expect(removeEventSpy).toHaveBeenCalledWith("beforeunload", expect.any(Function))
    expect(removeEventSpy).toHaveBeenCalledWith("popstate", expect.any(Function))
  })

  it("beforeunload handler calls preventDefault when dirty", () => {
    renderHook(() => useUnsavedChangesGuard(true, { onDiscard: jest.fn() }))
    const event = new Event("beforeunload") as BeforeUnloadEvent
    const preventDefaultSpy = jest.spyOn(event, "preventDefault")
    window.dispatchEvent(event)
    expect(preventDefaultSpy).toHaveBeenCalledTimes(1)
  })
})
