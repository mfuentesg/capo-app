export type SupportedPlatform = "cifraclub" | "ultimate-guitar" | "lacuerda" | "unknown"

export function detectPlatform(url: URL): SupportedPlatform {
  const host = url.hostname.replace(/^www\./, "")
  if (host === "cifraclub.com.br") return "cifraclub"
  if (host === "ultimate-guitar.com" || host === "tabs.ultimate-guitar.com") return "ultimate-guitar"
  if (host === "lacuerda.net") return "lacuerda"
  return "unknown"
}
