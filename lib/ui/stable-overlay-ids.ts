const INVALID_ID_CHARS = /[^a-zA-Z0-9_-]+/g
const MULTIPLE_DASHES = /-+/g
const EDGE_DASHES = /^-+|-+$/g

export function toStableIdPart(value: string | number | null | undefined, fallback = "item") {
  const normalized = String(value ?? "")
    .toLowerCase()
    .replace(INVALID_ID_CHARS, "-")
    .replace(MULTIPLE_DASHES, "-")
    .replace(EDGE_DASHES, "")

  return normalized || fallback
}

export function createOverlayIds(base: string) {
  const idBase = toStableIdPart(base, "overlay")

  return {
    base: idBase,
    triggerId: `${idBase}-trigger`,
    contentId: `${idBase}-content`,
    titleId: `${idBase}-title`,
    descriptionId: `${idBase}-description`,
    handleId: `${idBase}-handle`
  }
}
