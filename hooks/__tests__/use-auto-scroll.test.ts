import { renderHook, act } from "@testing-library/react"
import type { RefObject } from "react"
import { useAutoScroll } from "../use-auto-scroll"

describe("useAutoScroll", () => {
  let rafCallbacks: FrameRequestCallback[]
  let rafSpy: jest.SpyInstance
  let cafSpy: jest.SpyInstance
  let containerRef: RefObject<HTMLDivElement | null>

  beforeEach(() => {
    rafCallbacks = []
    rafSpy = jest.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      rafCallbacks.push(cb)
      return rafCallbacks.length
    })
    cafSpy = jest.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {})
    containerRef = { current: null }
  })

  afterEach(() => {
    jest.restoreAllMocks()
    rafCallbacks = []
  })

  it("starts with isScrolling false", () => {
    const { result } = renderHook(() => useAutoScroll({ speed: 50, containerRef }))
    expect(result.current.isScrolling).toBe(false)
  })

  it("start() sets isScrolling to true", () => {
    const { result } = renderHook(() => useAutoScroll({ speed: 50, containerRef }))
    act(() => {
      result.current.start()
    })
    expect(result.current.isScrolling).toBe(true)
    expect(rafSpy).toHaveBeenCalled()
  })

  it("stop() sets isScrolling to false", () => {
    const { result } = renderHook(() => useAutoScroll({ speed: 50, containerRef }))
    act(() => {
      result.current.start()
    })
    expect(result.current.isScrolling).toBe(true)
    act(() => {
      result.current.stop()
    })
    expect(result.current.isScrolling).toBe(false)
    expect(cafSpy).toHaveBeenCalled()
  })

  it("toggle() starts scrolling when stopped", () => {
    const { result } = renderHook(() => useAutoScroll({ speed: 50, containerRef }))
    act(() => {
      result.current.toggle()
    })
    expect(result.current.isScrolling).toBe(true)
  })

  it("toggle() stops scrolling when running", () => {
    const { result } = renderHook(() => useAutoScroll({ speed: 50, containerRef }))
    act(() => {
      result.current.toggle()
    })
    expect(result.current.isScrolling).toBe(true)
    act(() => {
      result.current.toggle()
    })
    expect(result.current.isScrolling).toBe(false)
  })

  it("start() does nothing if already scrolling", () => {
    const { result } = renderHook(() => useAutoScroll({ speed: 50, containerRef }))
    act(() => {
      result.current.start()
    })
    const callCount = rafSpy.mock.calls.length
    act(() => {
      result.current.start()
    })
    expect(rafSpy.mock.calls.length).toBe(callCount)
  })

  it("auto-stops when window is at bottom", () => {
    Object.defineProperty(window, "scrollY", { value: 900, writable: true, configurable: true })
    Object.defineProperty(window, "innerHeight", {
      value: 100,
      writable: true,
      configurable: true
    })
    Object.defineProperty(document.body, "scrollHeight", {
      value: 1000,
      writable: true,
      configurable: true
    })

    const { result } = renderHook(() => useAutoScroll({ speed: 50, containerRef }))
    act(() => {
      result.current.start()
    })
    expect(result.current.isScrolling).toBe(true)

    act(() => {
      // Run the first RAF tick — should detect bottom and stop
      rafCallbacks.forEach((cb) => cb(performance.now()))
    })

    expect(result.current.isScrolling).toBe(false)
  })

  it("cancels RAF on unmount", () => {
    const { result, unmount } = renderHook(() => useAutoScroll({ speed: 50, containerRef }))
    act(() => {
      result.current.start()
    })
    unmount()
    expect(cafSpy).toHaveBeenCalled()
  })

  it("scrolls a custom element container", () => {
    const el = document.createElement("div")
    el.className = "overflow-y-auto"
    Object.defineProperty(el, "scrollTop", { value: 0, writable: true, configurable: true })
    Object.defineProperty(el, "clientHeight", { value: 400, writable: true, configurable: true })
    Object.defineProperty(el, "scrollHeight", { value: 2000, writable: true, configurable: true })

    const host = document.createElement("div")
    el.appendChild(host)
    document.body.appendChild(el)
    const ref: RefObject<HTMLDivElement> = { current: host as HTMLDivElement }

    const { result } = renderHook(() => useAutoScroll({ speed: 100, containerRef: ref }))
    act(() => {
      result.current.start()
    })

    act(() => {
      rafCallbacks.forEach((cb) => cb(performance.now() + 100))
    })

    // Still scrolling (not at bottom) — should queue another RAF
    expect(result.current.isScrolling).toBe(true)

    act(() => {
      result.current.stop()
    })

    document.body.removeChild(el)
  })
})
