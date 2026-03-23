const EXCLUDED_PREFIXES = new Set([
  "busca",
  "videos",
  "artistas",
  "noticias",
  "blog",
  "playlists",
  "cursos",
  "categorias",
  "cifras"
])

export async function searchCifraClub(title: string, artist: string): Promise<URL> {
  const searchUrl = new URL("https://www.cifraclub.com.br/busca/")
  searchUrl.searchParams.set("q", `${artist} ${title}`)

  const res = await fetch(searchUrl.href, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; Capo/1.0)" }
  })
  if (!res.ok) throw new Error("searchFailed")

  const html = await res.text()

  // Song pages follow the /artist-slug/song-slug/ pattern (lowercase, hyphens only)
  for (const [, path] of html.matchAll(/href="(\/[a-z0-9-]+\/[a-z0-9-]+\/)"/g)) {
    const firstSegment = path.split("/").filter(Boolean)[0]
    if (!EXCLUDED_PREFIXES.has(firstSegment)) {
      return new URL(`https://www.cifraclub.com.br${path}`)
    }
  }

  throw new Error("notFound")
}
