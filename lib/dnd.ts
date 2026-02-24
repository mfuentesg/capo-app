/**
 * Registers a one-time capture-phase listener that discards the next
 * document-level click event. Call this immediately after a drag or swipe
 * ends to prevent the browser's synthetic click (fired on pointerup) from
 * triggering unintended actions (e.g. opening a song detail).
 *
 * The 500ms safety timeout removes the listener even if no click fires
 * (e.g. drag cancelled via keyboard).
 */
export function blockNextDocumentClick() {
  const handler = (e: MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    document.removeEventListener("click", handler, true)
  }
  document.addEventListener("click", handler, true)
  setTimeout(() => document.removeEventListener("click", handler, true), 500)
}
